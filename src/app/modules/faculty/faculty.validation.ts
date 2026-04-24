import z from "zod";
import { userNameValidationSchema } from "../student/student.validation.js";

const createFacultyValidationSchema = z
  .object({
    name: userNameValidationSchema,
    email: z.string().email("Invalid email address"),
    experience: z.number().min(0, "Faculty experience must be greater than 0"),
    designation: z.string().min(1, "Faculty designation is required"),
    contactNo: z.string().min(1, "Faculty contact number is required"),
    emergencyContactNo: z
      .string()
      .min(1, "Faculty emergency contact number is required"),
    // profileImage: z.string().optional(),
    gender: z.enum(["male", "female", "other"], { message: "Invalid gender" }),
    dateOfBirth: z.coerce.date({ message: "Invalid date of birth" }),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
      message: "Invalid blood group",
    }),
    presentAddress: z.string().min(1, "Faculty present address is required"),
    permanentAddress: z
      .string()
      .min(1, "Faculty permanent address is required"),
  })
  .strict();

// * Body for POST /create-faculty: matches `CreateFaculty` controller (`password` + `facultyData`).
const createFacultyPayloadSchema = z
  .object({
    password: z
      .string()
      .refine((val) => val.trim() === "" || val.length >= 6, {
        message:
          "Password must be at least 6 characters, or use an empty string for the default password",
      })
      .optional(),
    facultyData: createFacultyValidationSchema,
  })
  .strict();

const facultyUpdateDataSchema = createFacultyValidationSchema
  .partial()
  .extend({
    name: userNameValidationSchema.partial().strict().optional(),
  })
  .strict();

//update faculty validation schema
const updateFacultyValidationSchema = z
  .object({
    faculty: facultyUpdateDataSchema,
  })
  .strict();
export const facultyValidations = {
  createFacultyPayloadSchema,
  updateFacultyValidationSchema,
};
