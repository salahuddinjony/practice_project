//AcademicDept validation file
import { z } from 'zod';


// Validation schema for creating a new academic department
const CreateAcademicDept = z.object({
    name: z.string().min(1, 'Academic department name is required'), // Ensure that the name field is a non-empty string, providing a clear error message if the validation fails.
    academicFaculty: z.string(" Academic faculty ID is required")
})

// Validation schema for updating an existing academic department
const UpdateAcademicDept = CreateAcademicDept.partial(); // This allows for partial updates, meaning that when updating an academic department, you can provide any subset of the fields defined in the original validation schema, making it flexible for different update scenarios.
export const academicDeptValidation = {
    CreateAcademicDept,
    UpdateAcademicDept
}