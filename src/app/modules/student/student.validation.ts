// zod
import { z } from "zod";

// Name Schema
export const userNameValidationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .max(20, "First name cannot exceed 20 characters")
    .regex(/^[A-Za-z]+$/, "First name should contain only letters"),

  middleName: z
    .string()
    .trim()
    .max(10, "Middle name cannot exceed 10 characters")
    .regex(/^[A-Za-z]*$/, "Middle name should contain only letters")
    .optional()
    .or(z.literal("")),

  lastName: z
    .string()
    .trim()
    .max(15, "Last name cannot exceed 15 characters")
    .regex(/^[A-Za-z]+$/, "Last name should contain only letters"),
});

// Guardian Schema
const guardianValidationSchema = z.object({
  fatherName: z.string().trim().min(1, "Father name is required"),
  fatherOccupation: z.string().trim().min(1, "Father occupation is required"),
  fatherContactNo: z
    .string()
    .regex(/^01\d{9}$/, "Father contact must be valid Bangladeshi number"),

  motherName: z.string().trim().min(1, "Mother name is required"),
  motherOccupation: z.string().trim().min(1, "Mother occupation is required"),
  motherContactNo: z
    .string()
    .regex(/^01\d{9}$/, "Mother contact must be valid Bangladeshi number"),
});

// Local Guardian Schema
const localGuardianValidationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  occupation: z.string().trim().min(1, "Occupation is required"),
  contactNo: z
    .string()
    .regex(/^01\d{9}$/, "Contact must be valid Bangladeshi number"),
  address: z.string().trim().min(1, "Address is required"),
});

// Main Student Schema
export const studentValidationSchema = z
  .object({
    // id: z.string({ message: 'Student ID is required' }).min(1, 'Student ID is required'),
    // password: z.string({ message: 'Password is required' }).min(6, 'Password must be at least 6 characters long'),
    name: userNameValidationSchema,
    gender: z.enum(["male", "female", "other"] as const, {
      message: "Gender must be 'male', 'female', or 'other'",
    }),

    dateOfBirth: z.coerce
      .date({
        message: "Date of birth is required and must be a valid date",
      })
      .refine((date) => date < new Date(), {
        message: "Date of birth must be in the past",
      }),
    email: z
      .string()
      .email("Invalid email address")
      .refine((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      }, "Invalid email format"),

    contactNo: z
      .string()
      .regex(/^01\d{9}$/, "Contact number must be 11 digits and start with 01"),

    emergencyContactNo: z
      .string()
      .regex(/^01\d{9}$/, "Emergency contact must be valid"),

    bloodGroup: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .optional(),

    presentAddress: z.string().min(1, "Present address is required"),
    permanentAddress: z.string().min(1, "Permanent address is required"),

    guardian: guardianValidationSchema,
    localGuardian: localGuardianValidationSchema,
    admissionSemester: z
      .string({ message: "Admission semester is required" })
      .min(1, "Admission semester is required"),
    academicDept: z
      .string({ message: "Academic department is required" })
      .min(1, "Academic department is required"),
  })
  .strict();

// For update, all fields are optional (empty `student` allowed when PATCH includes a profile `file`; controller enforces at least one of JSON fields or file).
const updateStudentPartialSchema = studentValidationSchema
  .partial()
  .extend({
    name: userNameValidationSchema.partial().strict().optional(),
    guardian: guardianValidationSchema.partial().strict().optional(),
    localGuardian: localGuardianValidationSchema.partial().strict().optional(),
  })
  .strict();

const updateStudentValidationSchema = z
  .object({
    student: updateStudentPartialSchema,
  })
  .strict();
export const studentValidation = {
  studentValidationSchema,
  updateStudentValidationSchema,
};
