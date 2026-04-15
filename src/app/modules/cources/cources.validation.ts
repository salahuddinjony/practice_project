import z from "zod";

const prerequisiteCourseValidationSchema = z
  .object({
    course: z.string().min(1, "Course ID is required"),
    isDeleted: z.boolean().optional(),
    // Keep backward compatibility for clients sending lowercase key.
    isdeleted: z.boolean().optional(),
  })
  .strict()
  .transform(({ isdeleted, isDeleted, ...rest }) => ({
    ...rest,
    isDeleted: isDeleted ?? isdeleted ?? false,
  }));

const createCourseValidationSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    prefix: z.string().min(1, "Prefix is required"),
    code: z.string().min(1, "Code is required"),
    credit: z.number().positive("Credit must be a positive number"),
    prerequisiteCources: z.array(prerequisiteCourseValidationSchema).optional(), // Make prerequisite courses optional
  })
  .strict();

const updateCourseValidationSchema = createCourseValidationSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one valid field to update",
  });

  //assign cources to faculties validation schema
  const assignCourcesToFacultiesValidationSchema = z.object({
    faculties: z.array(z.string()).min(1, "Faculties are required"),
  });

  //unassign cources from faculties validation schema
  const unassignCourcesFromFacultiesValidationSchema = z.object({
    faculties: z.array(z.string()).min(1, "Faculties are required"),
  });


export const courseValidation = {
  createCourseValidationSchema,
  updateCourseValidationSchema,
  assignCourcesToFacultiesValidationSchema,
  unassignCourcesFromFacultiesValidationSchema,
};
