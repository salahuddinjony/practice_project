import { Schema, model } from 'mongoose'
import { AcademicFaculty } from './academicFaculty.interface.js'
import { applyExcludeFields } from '../../utils/excludeFiledWhenCreateResponse.js';
import { restrictUpdateFieldsChecker } from '../../utils/restrictedUpdateFiled.js';
const academicFaultySchema = new Schema<AcademicFaculty>({
    facultyId: {
        type: String,
        required: [true, 'Academic faculty id is required'],
        unique: [true, 'Academic faculty id must be unique']
    },
    name: {
        type: String,
        required: [true, 'Academic faculty name is required'],
        unique: [true, 'Academic faculty name must be unique']
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false
    }
}, {
    timestamps: true
})

// Exclude password and isDeleted fields when converting to JSON
applyExcludeFields<AcademicFaculty>(academicFaultySchema, ['isDeleted']);

restrictUpdateFieldsChecker(academicFaultySchema, undefined, ["facultyId"]); // This will restrict updating the isDeleted and facultyId fields in the AcademicFaculty schema for the specified update methods.


// academicFaultySchema.pre('findOneAndUpdate', function () {

//     const update = this.getUpdate() as any;

//     const restrictedFields = ['isDeleted', 'facultyId'];

//     for (const field of restrictedFields) {

//         if (
//             update?.[field] !== undefined ||
//             update?.$set?.[field] !== undefined
//         ) {
//             throw new Error(`${field} field cannot be updated`);
//         }
//     }
// });

const AcademicFacultyModel = model<AcademicFaculty>('AcademicFaculty', academicFaultySchema)

export default AcademicFacultyModel