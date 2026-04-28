import { paginate, parseListQuery } from "../../builder/queryBuilder.js";
import AppError from "../../errors/handleAppError.js";
import { normalizeMongoUpdatePayload } from "../../utils/mongoPartialUpdate.js";
import AcademicDeptModel from "../academicDept/academicDept.model.js";
import { AcademicSemesterModel } from "../academicSemester/academicSemester.model.js";
import AcademicFacultyModel from "../academiFaculty/academicFaculty.model.js";
import { CourseModel } from "../cources/cources.model.js";
import { FacultyModel } from "../faculty/faculty.model.js";
import { OfferedCourseModel } from "../offeredCourse/offeredCourse.model.js";
import SemesterRegistrationModel from "../semisterRegistration/semisterRegistration.model.js";
import { StudentModel } from "../student/student.model.js";
import { EnrolledCourse } from "./enrolledCourse.interface.js";
import { EnrolledCourseModel } from "./enrolledCourse.model.js";
import { startSession, Types } from "mongoose";
import {
  evaluateCourseMarks,
  mergeAssessmentMarks,
} from "./utils/enrolledCourse.marksCalculation.js";
import { TokenPayloadType } from "../../utils/commonTypes/types.js";

const createEnrolledCourseIntoDB = async (
  userId: string,
  payload: Partial<EnrolledCourse>,
) => {
  const session = await startSession();

  try {
    session.startTransaction();

    // 1. Offered course (only required fields)
    const offeredCourse = await OfferedCourseModel.findOne({
      _id: payload.offeredCourse,
      isDeleted: false,
    })
      .select(
        "_id maxCapacity semseterRegistration academicDepartment course faculty",
      )
      .session(session)
      .lean();

    if (!offeredCourse) {
      throw new AppError("Invalid offered course ID", 400);
    }

    // 2. Parallel queries (only IDs needed)
    const [student, semesterRegistration, academicDepartment, course, faculty] =
      await Promise.all([
        StudentModel.findOne({
          user: userId,
          isDeleted: false,
        })
          .select("_id")
          .session(session)
          .lean(),

        SemesterRegistrationModel.findOne({
          _id: offeredCourse.semseterRegistration,
          isDeleted: false,
        })
          .select("_id academicSemester minCredit maxCredit")
          .session(session)
          .lean(),

        AcademicDeptModel.findOne({
          _id: offeredCourse.academicDepartment,
          isDeleted: false,
        })
          .select("_id academicFaculty")
          .session(session)
          .lean(),

        CourseModel.findOne({
          _id: offeredCourse.course,
          isDeleted: false,
        })
          .select("_id credit")
          .session(session)
          .lean(),

        FacultyModel.findOne({
          _id: offeredCourse.faculty,
          isDeleted: false,
        })
          .select("_id")
          .session(session)
          .lean(),
      ]);

    // 3. Validations
    if (!student) throw new AppError("Invalid student ID", 400);
    if (!semesterRegistration)
      throw new AppError("Invalid semester registration ID", 400);

    if (!academicDepartment)
      throw new AppError("Invalid academic department ID", 400);
    if (!course) throw new AppError("Invalid course ID", 400);
    if (!faculty) throw new AppError("Invalid faculty ID", 400);

    // 4. Dependent queries (only IDs needed)
    const [academicSemester, academicFaculty] = await Promise.all([
      AcademicSemesterModel.findOne({
        _id: semesterRegistration.academicSemester,
        isDeleted: false,
      })
        .select("_id")
        .session(session)
        .lean(),

      AcademicFacultyModel.findOne({
        _id: academicDepartment.academicFaculty,
        isDeleted: false,
      })
        .select("_id")
        .session(session)
        .lean(),
    ]);

    if (!academicSemester) {
      throw new AppError("Invalid academic semester ID", 400);
    }

    if (!academicFaculty) {
      throw new AppError("Invalid academic faculty ID", 400);
    }
    //check taken course creadit are within the min and max credit of the semester registration
    const takenCourseCredit = await EnrolledCourseModel.aggregate([
      {
        $match: {
          student: student._id,
          isDeleted: false,
          semesterRegistration: semesterRegistration._id,
        },
      },
      {
        $lookup: {
          from: "courses", // join the course collection with the enrolled course collection
          localField: "course", // local field is the course id in the enrolled course collection
          foreignField: "_id", // foreign field is the course id in the course collection
          as: "courseDoc", // as is the name of the new field in the enrolled course collection
        },
      },
      {
        $unwind: "$courseDoc", //unwind the courseDoc array to get the credit of the course
      },
      {
        $group: {
          // group the courses by the student id and semester registration id to get the total credit of the courses
          _id: null, // _id is null because we are grouping by the student id and semester registration id
          totalCredit: { $sum: "$courseDoc.credit" },
        },
      },
    ]).session(session);
    const totalCredit = takenCourseCredit[0]?.totalCredit || 0;

    const newTotalCredit = totalCredit + course.credit;
    console.log({
      studentId: String(student._id),
      semesterRegistrationId: String(semesterRegistration._id),
      currentTakenCredit: totalCredit,
      incomingCourseCredit: course.credit,
      newTotalCredit,
      maxAllowedCredit: semesterRegistration.maxCredit,
    });
    if (newTotalCredit > semesterRegistration.maxCredit) {
      throw new AppError(
        "Taken course credit is greater than the max credit of the semester registration",
        400,
      );
    }

    // 5. Check already enrolled (only existence needed)
    const isEnrolled = await EnrolledCourseModel.findOne({
      offeredCourse: offeredCourse._id,
      semesterRegistration: offeredCourse.semseterRegistration,
      student: student._id,
      isDeleted: false,
    })
      .select("_id")
      .session(session)
      .lean();

    if (isEnrolled) {
      throw new AppError(
        "This student is already enrolled in this offered course",
        400,
      );
    }

    // 6. Atomic capacity update (no need for new:true)
    const updatedCourse = await OfferedCourseModel.findOneAndUpdate(
      {
        _id: offeredCourse._id,
        maxCapacity: { $gt: 0 },
      },
      {
        $inc: { maxCapacity: -1 },
      },
      { session },
    );

    if (!updatedCourse) {
      throw new AppError("Max capacity is full", 400);
    }

    // 7. Prepare payload
    const newPayload = {
      ...payload,
      semesterRegistration: semesterRegistration._id,
      academicSemester: academicSemester._id,
      academicDepartment: academicDepartment._id,
      academicFaculty: academicFaculty._id,
      course: course._id,
      student: student._id,
      faculty: faculty._id,
      isEnrolled: true,
    };

    // 8. Create
    const [result] = await EnrolledCourseModel.create([newPayload], {
      session,
    });

    await session.commitTransaction();
    return result;
  } catch (error: any) {
    await session.abortTransaction();

    throw new AppError(
      error?.message || "Failed to create enrolled course",
      error?.statusCode || 500,
    );
  } finally {
    await session.endSession();
  }
};

const getAllEnrolledCoursesFromDB = async (
  query: Record<string, unknown> = {},
) => {
  const parsed = parseListQuery(query, {
    searchableFields: [
      "semesterRegistration",
      "academicSemester",
      "academicDepartment",
      "academicFaculty",
      "course",
    ],
    baseFilter: { isDeleted: false },
  });
  const { meta, data: enrolledCourses } = await paginate(
    EnrolledCourseModel,
    parsed,
    (q) =>
      q
        .populate(
          "academicSemester academicDepartment academicFaculty course faculty",
        )
        .populate({
          path: "semesterRegistration",
          populate: {
            path: "academicSemester",
          },
        })
        .populate({
          path: "student",
          populate: [
            {
              path: "academicDept",
              populate: {
                path: "academicFaculty",
              },
            },
            { path: "user" },
          ],
        })
        .populate({
          path: "offeredCourse",
          populate: [
            { path: "course" },
            { path: "faculty" },
            { path: "academicDepartment" },
            { path: "semseterRegistration" },
          ],
        }),
  );
  return { meta, enrolledCourses };
};
const getEnrolledCourseByIdFromDB = async (enrolledCourseId: string) => {
  const enrolledCourse = await EnrolledCourseModel.findOne({
    _id: enrolledCourseId,
    isDeleted: false,
  });
  if (!enrolledCourse) {
    throw new AppError("Enrolled course not found", 404);
  }
  return enrolledCourse;
};

// get my enrolled courses from DB
const getMyEnrolledCoursesFromDB = async (
  user: TokenPayloadType,
  query: Record<string, unknown> = {},
) => {
  //check this student is valid or not
  const student = await StudentModel.findOne({
    user: user._id as Types.ObjectId,
    isDeleted: false,
  });
  if (!student) {
    throw new AppError("Student not found", 404);
  }
  const parsed = parseListQuery(query, {
    searchableFields: [
      "academicSemester.name",
      "academicSemester.startMonth",
      "academicSemester.endMonth",
      "semesterRegistration.status",
      "academicDepartment.name",
      "academicFaculty.name",
      "course.title",
      "course.prefix",
    ],
    baseFilter: { isDeleted: false, student: student._id },
  });
  const { meta, data: enrolledCourses } = await paginate(
    EnrolledCourseModel,
    parsed,
    (q) =>
      q
        .populate(
          "academicSemester academicDepartment academicFaculty course faculty",
        )
        .populate({
          path: "semesterRegistration",
          populate: {
            path: "academicSemester",
          },
        })
        .populate({
          path: "student",
          populate: [
            {
              path: "academicDept",
              populate: {
                path: "academicFaculty",
              },
            },
            { path: "user" },
          ],
        })
        .populate({
          path: "offeredCourse",
          populate: [
            { path: "course" },
            { path: "faculty" },
            { path: "academicDepartment" },
            { path: "semseterRegistration" },
          ],
        }),
  );
  return { meta, enrolledCourses };
};

//update enrolled course by id in DB
const updateEnrolledCourseByIdInDB = async (
  enrolledCourseId: string,
  updatedData: Partial<EnrolledCourse>,
) => {
  const { student, semesterRegistration, offeredCourse, courseMarks } =
    updatedData;
  console.log({
    studentId: student,
    semesterRegistrationId: semesterRegistration,
    offeredCourseId: offeredCourse,
    courseMarks: courseMarks,
  });
  if (!student || !semesterRegistration || !offeredCourse) {
    throw new AppError(
      "student, semesterRegistration, offeredCourse are required",
      400,
    );
  }

  const enrolledCourse = await EnrolledCourseModel.findOne({
    _id: enrolledCourseId,
    student: student,
    semesterRegistration: semesterRegistration,
    offeredCourse: offeredCourse,
    isDeleted: false,
  });
  if (!enrolledCourse) {
    throw new AppError("Enrolled course not found", 404);
  }

  if (!courseMarks) {
    throw new AppError("At least one courseMarks field is required", 400);
  }

  const mergedMarks = mergeAssessmentMarks(
    enrolledCourse.courseMarks,
    courseMarks,
  );
  const { total, grade, gradePoints, status, isCourseCompleted } =
    evaluateCourseMarks(mergedMarks);

  // update marks and all derived fields together
  const normalizedPayload = normalizeMongoUpdatePayload({
    courseMarks: {
      ...updatedData.courseMarks,
      total,
      grade,
      gradePoints,
      status,
    },
    isCourseCompleted,
  }) as Record<string, unknown>;

  const updatedEnrolledCourse = await EnrolledCourseModel.findByIdAndUpdate(
    enrolledCourseId,
    { $set: normalizedPayload },
    { new: true, runValidators: true },
  );
  return updatedEnrolledCourse;
};
const deleteEnrolledCourseByIdFromDB = async (courseId: string) => {
  return {};
};

export const EnrolledCourseService = {
  createEnrolledCourseIntoDB,
  getAllEnrolledCoursesFromDB,
  getEnrolledCourseByIdFromDB,
  updateEnrolledCourseByIdInDB,
  deleteEnrolledCourseByIdFromDB,
  getMyEnrolledCoursesFromDB,
};
