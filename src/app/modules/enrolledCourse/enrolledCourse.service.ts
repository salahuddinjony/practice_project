import { paginate, parseListQuery } from "../../builder/queryBuilder.js";
import AppError from "../../errors/handleAppError.js";
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
import mongoose from "mongoose";
const createEnrolledCourseIntoDB = async (
  userId: string,
  payload: Partial<EnrolledCourse>,
) => {
  // 1. Check offered course
  const offeredCourse = await OfferedCourseModel.findOne({
    _id: payload.offeredCourse,
    isDeleted: false,
  }).lean();

  if (!offeredCourse) {
    throw new AppError("Invalid offered course ID", 400);
  }
  //check maxCapacity is full or not
  if (offeredCourse.maxCapacity <= 0) {
    throw new AppError("Max capacity is full", 400);
  }

  // 2. Run independent queries in parallel
  const [student, semesterRegistration, academicDepartment, course, faculty] =
    await Promise.all([
      StudentModel.findOne({
        user: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      })
        .select("_id")
        .lean(),

      SemesterRegistrationModel.findOne({
        _id: offeredCourse.semseterRegistration,
        isDeleted: false,
      }).lean(),

      AcademicDeptModel.findOne({
        _id: offeredCourse.academicDepartment,
        isDeleted: false,
      }).lean(),

      CourseModel.findOne({
        _id: offeredCourse.course,
        isDeleted: false,
      }).lean(),

      FacultyModel.findOne({
        _id: offeredCourse.faculty,
        isDeleted: false,
      }).lean(),
    ]);

  if (!student) throw new AppError("Invalid student ID", 400);
  if (!semesterRegistration)
    throw new AppError("Invalid semester registration ID", 400);
  if (!academicDepartment)
    throw new AppError("Invalid academic department ID", 400);
  if (!course) throw new AppError("Invalid course ID", 400);
  if (!faculty) throw new AppError("Invalid faculty ID", 400);

  // 3. Academic semester (depends on semesterRegistration)
  const academicSemester = await AcademicSemesterModel.findOne({
    _id: semesterRegistration.academicSemester,
    isDeleted: false,
  }).lean();

  if (!academicSemester) {
    throw new AppError("Invalid academic semester ID", 400);
  }

  // 4. Academic faculty (depends on department)
  const academicFaculty = await AcademicFacultyModel.findOne({
    _id: academicDepartment.academicFaculty,
    isDeleted: false,
  }).lean();

  if (!academicFaculty) {
    throw new AppError("Invalid academic faculty ID", 400);
  }

  // 5. Check already enrolled
  const isEnrolled = await EnrolledCourseModel.findOne({
    offeredCourse: offeredCourse._id,
    semesterRegistration: offeredCourse.semseterRegistration,
    student: student._id, //  IMPORTANT
    isDeleted: false,
  });

  if (isEnrolled) {
    throw new AppError(
      "This student is already enrolled in this offered course",
      400,
    );
  }

  // 6. Prepare payload (clean way)
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

  // 7. Create
  return await EnrolledCourseModel.create(newPayload);
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
const getEnrolledCourseByIdFromDB = async (courseId: string) => {
  return {};
};
const updateEnrolledCourseByIdInDB = async (
  courseId: string,
  updatedData: EnrolledCourse,
) => {
  return {};
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
};
