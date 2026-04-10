import { Schema, model } from 'mongoose'
import { AcademicFaculty } from './academicFaculty.interface.js'
const academicFaultySchema = new Schema<AcademicFaculty>({
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
academicFaultySchema.pre('findOneAndUpdate', function () {

    const update = this.getUpdate() as any;

    const restrictedFields = ['isDeleted'];

    for (const field of restrictedFields) {

        if (
            update?.[field] !== undefined ||
            update?.$set?.[field] !== undefined
        ) {
            throw new Error(`${field} field cannot be updated`);
        }
    }
});

const AcademicFacultyModel = model<AcademicFaculty>('AcademicFaculty', academicFaultySchema)

export default AcademicFacultyModel