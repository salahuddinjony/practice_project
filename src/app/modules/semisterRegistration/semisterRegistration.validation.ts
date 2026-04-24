import { z } from "zod";

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const semisterRegisterationBaseSchema = z
  .object({
    academicSemester: z.string().min(1, "Academic semester ID is required"),

    status: z.enum(["UPCOMING", "ONGOING", "COMPLETED"], {
      message: "Status must be one of: UPCOMING, ONGOING, COMPLETED",
    }),

    startDate: z.coerce.date(), // date is required its must be a valid date
    endDate: z.coerce.date(), // date is required its must be a valid date
  })
  .strict();

const semisterRegisterationValidation = semisterRegisterationBaseSchema.refine(
  (data) => {
    return (
      data.endDate > data.startDate &&
      data.startDate >= getStartOfToday() &&
      Object.keys(data).length > 0
    );
  },
  {
    message:
      "End Date must be after Start Date and start date must be today or a future date",
    path: ["endDate", "startDate"],
  },
);

//for the update validation we will make all the fields optional but at least one field should be provided
const semisterRegisterationUpdateValidation = semisterRegisterationBaseSchema
  .partial()
  .refine(
    (data) => {
      return Object.keys(data).length > 0;
    },
    {
      message: "At least one field must be provided for update",
    },
  )
  .refine(
    (data) => {
      if (!data.startDate) return true;
      return data.startDate >= getStartOfToday();
    },
    {
      message: "Start Date must be today or a future date",
      path: ["startDate"],
    },
  )
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return (
        data.endDate > data.startDate &&
        data.startDate >= getStartOfToday() &&
        data.startDate < data.endDate
      );
    },
    {
      message: "End Date must be after Start Date",
      path: ["endDate"],
    },
  );

export const semisterRegisterationValidationSchema = {
  semisterRegisterationValidation,
  semisterRegisterationUpdateValidation,
};
