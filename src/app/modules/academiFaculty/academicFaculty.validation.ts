import z from 'zod';

// Define the validation schema for creating or updating an academic faculty
const academicFacultyValidationSchema = z.object({
    name: z.string().min(1, 'Academic faculty name is required') // Ensure that the name field is a non-empty string, providing a clear error message if the validation fails.
});

// For update, all fields are optional
const updateAcademicFacultyValidationSchema = academicFacultyValidationSchema.partial();  // This allows for partial updates, meaning that when updating an academic faculty, you can provide any subset of the fields defined in the original validation schema, making it flexible for different update scenarios.

export const academicFacultyValidations = {
    academicFacultyValidationSchema,
    updateAcademicFacultyValidationSchema
}
