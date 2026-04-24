import { optional } from "joi";
import z from "zod";

const createEnrolledCourseValidationSchema = z
  .object({
    // courseRegistration: z.string().min(1, "Course registration is required"),
    // academicSemester: z.string().min(1, "Academic semester is required"),
    // academicDepartment: z.string().min(1, "Academic department is required"),
    // academicFaculty: z.string().min(1, "Academic faculty is required"),
    // faculty: z.string().min(1, "Faculty is required"),
    offeredCourse: z.string().min(1, "Offered course is required"),
    // course: z.string().min(1, "Course is required"),
    // student: z.string().min(1, "Student is required"),
    // isEnrolled: z.boolean().optional(),
    // isCourseCompleted: z.boolean().optional(),
  })
  .strict();

//for update
const updateEnrolledCourseValidationSchema = z
  .object({
    semesterRegistration: z.string().min(1, "Semester registration is required"),
    offeredCourse: z.string().min(1, "Offered course is required"),
    student: z.string().min(1, "Student is required"),
    courseMarks: z
      .object({
        classTest1: z.number().min(0).max(20).optional(),
        midTerm: z.number().min(0).max(20).optional(),
        classTest2: z.number().min(0).max(20).optional(),
        finalExam: z.number().min(0).max(40).optional(),
      })
      .strict().refine((data) => {
        return data.classTest1 !== undefined || data.midTerm !== undefined || data.classTest2 !== undefined || data.finalExam !== undefined;
      }, {
        message: "At least one field must be provided for update",
        path: ["courseMarks"],
      }).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
    path: ["body"], 
  });
export const enrolledCourseValidation = {
  createEnrolledCourseValidationSchema,
  updateEnrolledCourseValidationSchema,
};
