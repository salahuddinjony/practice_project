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
const updateEnrolledCourseValidationSchema = createEnrolledCourseValidationSchema
//   .omit({
//     //omit the fields that are not allowed to be updated
//     courseRegistration: true,
//     student: true,
//   })
//   .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const enrolledCourseValidation = {
  createEnrolledCourseValidationSchema,
  updateEnrolledCourseValidationSchema,
};
