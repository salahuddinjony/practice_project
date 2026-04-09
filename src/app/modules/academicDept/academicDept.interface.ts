import { Types } from 'mongoose';
import { AcademicFaculty } from '../academiFaculty/academicFaculty.interface.js';
export type AcademicDept = {
    name: string;
    academicFaculty: Types.ObjectId | AcademicFaculty; // This will store the ID of the associated academic faculty
    isDeleted?: boolean; // Optional field to indicate if the department is deleted
}