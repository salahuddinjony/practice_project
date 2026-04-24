import { Types } from "mongoose";
export type Grade =  "A+" | "A" | "A-" | "B" | "C" | "D" | "F" | "N/A";

export type CourseMarks = {
  classTest1: number;
  midTerm: number;
  classTest2: number;
  finalExam: number;
  total: number;
  grade: Grade;
  gradePoints: number;
  status: "PASS" | "FAIL" | "N/A";
  isDeleted: boolean;
};

export type EnrolledCourse = {
  semesterRegistration: Types.ObjectId;
  academicSemester: Types.ObjectId;
  academicDepartment: Types.ObjectId;
  academicFaculty: Types.ObjectId;
  faculty: Types.ObjectId;
  offeredCourse: Types.ObjectId;
  course: Types.ObjectId;
  student: Types.ObjectId;
  isEnrolled: boolean;
  courseMarks: CourseMarks;
  isCourseCompleted: boolean;
  isDeleted: boolean;
};
