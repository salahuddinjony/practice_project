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

const AcademicFacultyModel = model<AcademicFaculty>('AcademicFaculty', academicFaultySchema)

export default AcademicFacultyModel