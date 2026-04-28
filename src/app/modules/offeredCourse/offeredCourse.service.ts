import { paginate, parseListQuery } from "../../builder/queryBuilder.js";
import AppError from "../../errors/handleAppError.js";
import AcademicDeptModel from "../academicDept/academicDept.model.js";
import { CourseModel } from "../cources/cources.model.js";
import { FacultyModel } from "../faculty/faculty.model.js";
import SemesterRegistrationModel from "../semisterRegistration/semisterRegistration.model.js";
import {
  assertNoFacultyScheduleConflict,
  assertOfferedCourseDatesWithinSemester,
} from "../../utils/offeredCourseScheduleValidation.js";
import { offeredCourse } from "./offeredCourse.interface.js";
import { OfferedCourseModel } from "./offeredCourse.model.js";
import { SemesterRegistrationStatus } from "../semisterRegistration/semisterRegistration.constant.js";
import { Types } from "mongoose";
import { TokenPayloadType } from "../../utils/commonTypes/types.js";
import { StudentModel } from "../student/student.model.js";
import { EnrolledCourseModel } from "../enrolledCourse/enrolledCourse.model.js";

const createOfferedCourseIntoDB = async (payload: offeredCourse) => {
  //check semester registration is valid or not
  const semesterReg = await SemesterRegistrationModel.findOne({
    _id: payload.semseterRegistration,
    isDeleted: false,
  });

  if (!semesterReg) {
    throw new AppError("Invalid semester registration ID", 400);
  }

  assertOfferedCourseDatesWithinSemester(
    payload.startDate,
    payload.endDate,
    semesterReg,
  );

  //then check academic department is valid or not
  const academicDepartment = await AcademicDeptModel.findOne({
    _id: payload.academicDepartment,
    isDeleted: false,
  });
  if (!academicDepartment)
    throw new AppError("Invalid academic department ID", 400);

  //then check course is valid or not
  const isValidCourse = await CourseModel.findOne({
    _id: payload.course,
    isDeleted: false,
  });
  if (!isValidCourse) throw new AppError("Invalid course ID", 400);

  //then check faculty is valid or not
  const isValidFaculty = await FacultyModel.findOne({
    _id: payload.faculty,
    isDeleted: false,
  });
  if (!isValidFaculty) throw new AppError("Invalid faculty ID", 400);

  // Duplicate check
  const exists = await OfferedCourseModel.findOne({
    semseterRegistration: payload.semseterRegistration,
    course: payload.course,
    section: payload.section,
    academicDepartment: payload.academicDepartment,
    faculty: payload.faculty,
  });

  if (exists) {
    throw new AppError("Offered course already exists", 400);
  }

  await assertNoFacultyScheduleConflict({
    semseterRegistration: payload.semseterRegistration,
    faculty: payload.faculty,
    startDate: payload.startDate,
    endDate: payload.endDate,
    days: payload.days,
  });

  return await OfferedCourseModel.create(payload);
};
//get all offered courses
const getMyOfferedCoursesFromDB = async (
  query: Record<string, unknown> = {},
  user: TokenPayloadType,
) => {
  //get current ongoing semester registration
  const ongoingSemesterRegistration = await SemesterRegistrationModel.findOne({
    status: SemesterRegistrationStatus.ONGOING,
    isDeleted: false,
  });
  if (!ongoingSemesterRegistration) {
    throw new AppError("No ongoing semester registration found", 404);
  }
  // get studeent with the user id
  const student = await StudentModel.findOne({
    user: user._id as Types.ObjectId,
    isDeleted: false,
  });
  if (!student) {
    throw new AppError("Student not found", 404);
  }
  // Parse pagination/sort from query (we're not using parsed.filter since we're aggregating)
  const parsed = parseListQuery(query, {
    searchableFields: [
      "section",
      "course.title",
      "course.code",
      "course.prefix",
      "semseterRegistration.status",
      "academicDepartment.name",
    ],
  });

  // Mongoose accepts "-createdAt title" but aggregation needs an object.
  const sortObj = String(parsed.sort)
    .split(" ")
    .filter(Boolean)
    .reduce<Record<string, 1 | -1>>((acc, token) => {
      if (token.startsWith("-")) acc[token.slice(1)] = -1;
      else acc[token] = 1;
      return acc;
    }, {});

  const enrolledCollection = EnrolledCourseModel.collection.name;
  const semesterRegistrationCollection =
    SemesterRegistrationModel.collection.name;

  const academicDeptCollection = AcademicDeptModel.collection.name;

  // Look up the offered courses for the student, filter already-enrolled ones, and return meta + offeredCourses
  const [facet] = await OfferedCourseModel.aggregate([
    {
      $match: {
        semseterRegistration: ongoingSemesterRegistration._id,
        academicDepartment: student.academicDept,
        isDeleted: false,
      },
    },
    // populate semester registration
    {
      $lookup: {
        from: semesterRegistrationCollection,
        localField: "semseterRegistration",
        foreignField: "_id",
        as: "semseterRegistration",
      },
    },
    { $unwind: "$semseterRegistration" },
    // populate academic department
    {
      $lookup: {
        from: academicDeptCollection,
        localField: "academicDepartment",
        foreignField: "_id",
        as: "academicDepartment",
      },
    },
    { $unwind: "$academicDepartment" },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "course",
      },
    },

    { $unwind: "$course" },

    // !important: Apply searchTerm + extra filters (e.g. section) from query params
    ...(Object.keys(parsed.filter).length ? [{ $match: parsed.filter }] : []),
    {
      $lookup: {
        from: enrolledCollection,
        let: {
          currentOngoingSemesterRegistration: ongoingSemesterRegistration._id,
          studentId: student._id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      "$semesterRegistration",
                      "$$currentOngoingSemesterRegistration",
                    ],
                  },
                  { $eq: ["$student", "$$studentId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          { $project: { course: 1 } },
        ],
        as: "enrolledCourse",
      },
    },
    {
      $lookup: {
        from: enrolledCollection,
        let: {
          studentId: student._id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$isCourseCompleted", true] },
                  { $eq: ["$student", "$$studentId"] },
                  { $eq: ["$isDeleted", false] },
                ],
              },
            },
          },
          { $project: { course: 1 } },
        ],
        as: "enrolledCompletedCourse",
      },
    },
    {
      $addFields: {
        completedCourseIds: {
          // * Map means we are going to return an array of course ids with looping from the enrolledCompletedCourse array
          $map: {
            input: "$enrolledCompletedCourse",
            as: "completedCourse",
            in: "$$completedCourse.course",
          },
        },
      },
    },

    {
      $addFields: {
        isPrerequisiteCompleted: {
          $or: [
            { $eq: ["$course.prerequisiteCources.course._id", []] },
            {
              $setIsSubset: [
                "$course.prerequisiteCources.course._id",
                "$completedCourseIds",
              ],
            },
          ],
        },
        isAlreadyEnrolled: {
          $in: [
            "$course._id",
            {
              $map: {
                input: "$enrolledCourse",
                as: "enroll",
                in: "$$enroll.course",
              },
            },
          ],
        },
      },
    },
    { $match: { isAlreadyEnrolled: false, isPrerequisiteCompleted: true } },
    {
      $project: {
        isAlreadyEnrolled: 0,
        enrolledCourse: 0,
        completedCourseIds: 0,
        isPrerequisiteCompleted: 0,
        enrolledCompletedCourse: 0,
      },
    },

    {
      // facet means we are going to return two arrays one is the offered courses and the other is the meta data
      $facet: {
        offeredCourses: [
          { $sort: Object.keys(sortObj).length ? sortObj : { createdAt: -1 } },
          { $skip: parsed.skip },
          { $limit: parsed.limit },
        ],
        meta: [
          { $count: "total" },
          {
            $addFields: {
              page: parsed.page,
              limit: parsed.limit,
              totalPages: { $ceil: { $divide: ["$total", parsed.limit] } },
            },
          },
        ],
      },
    },
  ]);

  const meta =
    facet?.meta?.[0] ??
    ({
      total: 0,
      page: parsed.page,
      limit: parsed.limit,
      totalPages: 0,
    } as const);

  const offeredCourses = facet?.offeredCourses ?? [];
  return { meta, offeredCourses };
};

//get single offered course by id
const getSingleOfferedCourseByIdFromDB = async (id: string) => {
  return await OfferedCourseModel.findOne({ _id: id, isDeleted: false });
};

//update offered course by id
const updateOfferedCourseByIdInDB = async (
  id: string,
  updatedData: Partial<offeredCourse>,
) => {
  const existing = await OfferedCourseModel.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!existing) {
    throw new AppError("Offered course not found", 404);
  }

  if (updatedData.faculty !== undefined) {
    const isValidFaculty = await FacultyModel.findOne({
      _id: updatedData.faculty,
      isDeleted: false,
    });
    if (!isValidFaculty) throw new AppError("Invalid faculty ID", 400);
  }

  const semesterReg = await SemesterRegistrationModel.findOne({
    _id: existing.semseterRegistration,
    isDeleted: false,
  });
  if (!semesterReg) {
    throw new AppError(
      "Invalid semester registration for this offered course",
      400,
    );
  }

  //then semesterReg status is not completed then we can update the offered course
  if (semesterReg.status !== SemesterRegistrationStatus.UPCOMING) {
    throw new AppError("Semester registration is not upcoming", 400);
  }

  const nextStart = updatedData.startDate ?? existing.startDate;
  const nextEnd = updatedData.endDate ?? existing.endDate;
  const nextFaculty = updatedData.faculty ?? existing.faculty;
  const nextDays = updatedData.days ?? existing.days;

  const scheduleFieldsTouched =
    updatedData.startDate !== undefined ||
    updatedData.endDate !== undefined ||
    updatedData.days !== undefined ||
    updatedData.faculty !== undefined;

  if (scheduleFieldsTouched) {
    assertOfferedCourseDatesWithinSemester(nextStart, nextEnd, semesterReg);
    await assertNoFacultyScheduleConflict({
      semseterRegistration: existing.semseterRegistration,
      faculty: nextFaculty,
      startDate: nextStart,
      endDate: nextEnd,
      days: nextDays,
      excludeOfferedCourseId: id,
    });
  }

  return await OfferedCourseModel.findByIdAndUpdate(id, updatedData, {
    new: true,
  });
};

//delete offered course by id
const deleteOfferedCourseByIdInDB = async (id: string) => {
  const offeredCourse = await OfferedCourseModel.findById(id);
  if (!offeredCourse) {
    throw new AppError("Offered course not found", 404);
  }
  const semesterReg = await SemesterRegistrationModel.findOne({
    _id: offeredCourse.semseterRegistration,
    isDeleted: false,
  });
  if (!semesterReg) {
    throw new AppError("Invalid semester registration ID", 400);
  }
  if (semesterReg.status !== SemesterRegistrationStatus.UPCOMING) {
    throw new AppError(
      "Semester registration is not upcoming, you can't delete it",
      400,
    );
  }
  return await OfferedCourseModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { returnDocument: "after" },
  );
};

export const OfferedCourseService = {
  createOfferedCourseIntoDB,
  getMyOfferedCoursesFromDB,
  getSingleOfferedCourseByIdFromDB,
  updateOfferedCourseByIdInDB,
  deleteOfferedCourseByIdInDB,
};
