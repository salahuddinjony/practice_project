import zod from 'zod';


const createUserValidationSchema = zod.object({
    id: zod.number({ message: 'ID must be a number' }),
    password: zod.string().min(6, 'Password must be at least 6 characters long'),
    needsPasswordReset: zod.boolean().optional().default(true),
    role: zod.enum(['admin', 'user', 'faculty'] as const, {
        message: "Role must be one of 'admin', 'user', or 'faculty'",
    }),
    isDeleted: zod.boolean().optional().default(false),
    status: zod.enum(['in-progress', 'active', 'inactive', 'pending', 'blocked']).optional().default('pending'),
});

const updateUserValidationSchema = zod.object({
    password: zod.string().min(6, 'Password must be at least 6 characters long').optional(),
    needsPasswordReset: zod.boolean().optional(),
    role: zod.enum(['admin', 'user', 'faculty'] as const, {
        message: "Role must be one of 'admin', 'user', or 'faculty'",
    }).optional(),
    isDeleted: zod.boolean().optional(),
    status: zod.enum(['in-progress', 'active', 'inactive', 'pending', 'blocked']).optional(),
});


// export method to validate user data using the createUserValidationSchema, this method takes in the data to be validated and returns the validated data if it is valid, or throws an error with a message containing all validation errors if the data is invalid.
export const zodValidateUserCreate = (data: unknown) => {
    const result = createUserValidationSchema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map(err => err.message);
        throw new Error(`Validation error: ${errors.join(', ')}`);
    }

    return result.data;
};

export const zodValidateUserUpdate = (data: unknown) => {
    const result = updateUserValidationSchema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map(err => err.message);
        throw new Error(`Validation error: ${errors.join(', ')}`);
    }

    return result.data;
};