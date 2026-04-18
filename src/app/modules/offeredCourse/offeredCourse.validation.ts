import z from "zod";

const offeredCourseValidation = z
  .object({
    semseterRegistration: z
      .string()
      .min(1, "Semester registration is required"),
    academicDepartment: z.string().min(1, "Academic department is required"),
    course: z.string().min(1, "Course is required"),
    faculty: z.string().min(1, "Faculty is required"),
    maxCapacity: z.number().min(1, "Max capacity is required"),
    section: z.string().min(1, "Section is required"),
    days: z.array(z.string()).min(1, "Days are required"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .strict()
  .refine(
    (data) => data.endDate > data.startDate && data.startDate >= new Date(),
    {
      message:
        "End Date must be after Start Date and Start Date must be today or a future date",
      path: ["endDate", "startDate"],
    },
  );

//for update

const updateOfferedCourseValidation = z
  .object({
    faculty: z.string().min(1, "Faculty is required").optional(),
    maxCapacity: z.number().min(1, "Max capacity is required").optional(),
    section: z.string().min(1, "Section is required").optional(),
    days: z.array(z.string()).min(1, "Days are required").optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
    path: ["body"],
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End Date must be after Start Date",
        path: ["endDate"],
      });
    }

    if (data.startDate && data.startDate < new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start Date must be today or a future date",
        path: ["startDate"],
      });
    }
  });

export const offeredCourseValidationSchema = {
  offeredCourseValidation,
  updateOfferedCourseValidation,
};
