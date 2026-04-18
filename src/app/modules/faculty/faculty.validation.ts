import z from "zod";

const createFacultyValidationSchema = z
  .object({
    name: z.string().min(1, "Faculty name is required"),
  })
  .strict();

const updateFacultyValidationSchema = createFacultyValidationSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one valid field to update",
  });

export const facultyValidations = {
  createFacultyValidationSchema,
  updateFacultyValidationSchema,
};
