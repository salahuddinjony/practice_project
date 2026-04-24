import { model, Schema } from "mongoose";
import { CourseMarks, EnrolledCourse } from "./enrolledCourse.interface.js";
import { applyExcludeFields } from "../../utils/excludeFiledWhenCreateResponse.js";

const gradeEnum = [ "A+", "A", "A-", "B", "C", "D", "F", "N/A"] as const;

export const CourseMarksSchema: Schema<CourseMarks> = new Schema<CourseMarks>({
  classTest1: { type: Number,min: 0, max: 20, default: 0, required: true },
  midTerm: { type: Number,min: 0, max: 20, default: 0, required: true },
  classTest2: { type: Number,min: 0, max: 20, default: 0, required: true },
  finalExam: { type: Number,min: 0, max: 40, default: 0, required: true },
  total: { type: Number,min: 0, max: 100, default: 0, required: true },
  grade: {
    type: String,
    default: "N/A",
    enum: {
      values: gradeEnum,
      message: "Grade must be one of A, B, C, D, F, or N/A",
    },
    required: true,
  },
  gradePoints: {
    type: Number,
    default: 0,
    min: 0,
    max: 4,
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: ["PASS", "FAIL", "N/A"],
      message: "Status must be one of PASS, FAIL, or N/A",
    },
    default: "N/A",
    required: true,
  },
  isDeleted: { type: Boolean, default: false, select: false },
});

// Enrolled Course Schema
const EnrolledCourseSchema = new Schema<EnrolledCourse>({
  semesterRegistration: {
    type: Schema.Types.ObjectId,
    ref: "SemesterRegistration",
    required: [true, "Semester registration is required"],
  },
  academicSemester: {
    type: Schema.Types.ObjectId,
    ref: "AcademicSemester",
    required: [true, "Academic semester is required"],
  },
  academicDepartment: {
    type: Schema.Types.ObjectId,
    ref: "AcademicDept",
    required: [true, "Academic department is required"],
  },
  academicFaculty: {
    type: Schema.Types.ObjectId,
    ref: "AcademicFaculty",
    required: [true, "Academic faculty is required"],
  },
  faculty: {
    type: Schema.Types.ObjectId,
    ref: "Faculty",
    required: [true, "Faculty is required"],
  },
  offeredCourse: {
    type: Schema.Types.ObjectId,
    ref: "OfferedCourse",
    required: [true, "Offered course is required"],
  },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  student: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: [true, "Student is required"],
  },
  isEnrolled: {
    type: Boolean,
    default: false,
    required: [true, "Enrolled is required"],
  },
  courseMarks: {
    type: CourseMarksSchema,
    default: () => ({}), //default value is an empty object
  },
  isCourseCompleted: {
    type: Boolean,
    default: false,
    required: [true, "Course completed is required"],
  },
  isDeleted: {
    type: Boolean,
    default: false,
    select: false,
    required: [true, "Deleted is required"],
  },
});

// Exclude password and isDeleted fields when converting to JSON
applyExcludeFields<EnrolledCourse>(EnrolledCourseSchema, ["isDeleted"]);

export const EnrolledCourseModel = model<EnrolledCourse>(
  "EnrolledCourse",
  EnrolledCourseSchema,
);
