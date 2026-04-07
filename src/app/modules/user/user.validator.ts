
import z from 'zod';
import { studentValidationSchema } from '../student/student.validation.js';


const createUserValidationSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long')
});

const updateUserValidationSchema = z.object({
    password: z.string(
        { message: 'Password must be a string' }
    ).min(6, 'Password must be at least 6 characters long').optional(),
    needsPasswordReset: z.boolean().optional(),
    role: z.enum(['admin', 'student', 'faculty'] as const, {
        message: "Role must be one of 'admin', 'student', or 'faculty'",
    }).optional(),
    isDeleted: z.boolean().optional(),
    status: z.enum(['in-progress', 'active', 'inactive', 'pending', 'blocked']).optional(),
});
const createStudentPayloadSchema = z.object({
    password: z.string().optional(),
    student: studentValidationSchema
})

export const userValidations = {
    createUserValidationSchema,
    updateUserValidationSchema,
    createStudentPayloadSchema  
}


// export method to validate user data using the createUserValidationSchema, this method takes in the data to be validated and returns the validated data if it is valid, or throws an error with a message containing all validation errors if the data is invalid.
// export const zodValidateUserCreate = (data: unknown) => {
//     const result = createUserValidationSchema.safeParse(data);

//     if (!result.success) {
//         const errors = result.error.issues.map(err => err.message);
//         throw new Error(`Validation error: ${errors.join(', ')}`);
//     }

//     return result.data;
// };



