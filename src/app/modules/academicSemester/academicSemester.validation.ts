import z from 'zod';
import { monthEnum, semesterCodeEnum, semesterNameEnum } from './academicSemester.constant.js';

// Define the validation schema for creating or updating an academic semester
const academicSemesterValidationSchema = z.object({
    name: z.enum([...semesterNameEnum], {
        message: "Name must be 'Autumn', 'Summer', or 'Fall'",
    }),
    code: z.enum([...semesterCodeEnum], {
        message: "Code must be '01', '02', or '03'",
    }),
    year: z.coerce.date({
        message: 'Year is required and must be a valid date',
    }),
    startMonth: z.enum([...monthEnum], {
        message: 'Start month must be a valid month',
    }),
    endMonth: z.enum([...monthEnum], {
        message: 'End month must be a valid month',
    })
}).strict();

// For update, all fields are optional
const updateAcademicSemesterValidationSchema = academicSemesterValidationSchema.partial().strict().refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one valid field to update',
});  // This allows for partial updates, meaning that when updating an academic semester, you can provide any subset of the fields defined in the original validation schema, making it flexible for different update scenarios.

export const academicValidatons = {
    academicSemesterValidationSchema,
    updateAcademicSemesterValidationSchema
}