

// AcademicDept schema implementation
import { Schema, model} from 'mongoose';
import { AcademicDept } from './academicDept.interface.js';

const academicDeptSchema = new Schema<AcademicDept>({
    name: { type: String, required: true },
    academicFaculty: {
        type: Schema.Types.ObjectId,
        ref: 'AcademicFaculty',
        required: true
    },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

// pre save hook to ensure that the academic faculty reference is valid before saving a department also check name is unique within the same faculty
academicDeptSchema.pre('save', async function (next) {
    try {
        const academicFacultyId = this.academicFaculty;

        // Check if faculty exists (recommended)
        const AcademicFacultyModel = model('AcademicFaculty');
        const facultyExists = await AcademicFacultyModel.exists({
            _id: academicFacultyId,
            isDeleted: false
        });

        if (!facultyExists) {
            throw new Error('Invalid academic faculty reference');
        }

        //  Check duplicate (exclude self in case of update)
        const existingDept = await model('AcademicDept').exists({
            name: this.name,
            academicFaculty: academicFacultyId,
            isDeleted: false,
            _id: { $ne: this._id } 
        });

        if (existingDept) {
            throw new Error('A department with the same name already exists within the same faculty');
        }


    } catch (error) {
        throw new Error('Invalid academic faculty reference');

    }
});

// pre update hook to ensure that the academic faculty reference is valid before updating a department also check name is unique within the same faculty
academicDeptSchema.pre('findOneAndUpdate', async function (next) {
    try {
        const updateData = this.getUpdate();
        const academicFacultyId = (updateData as any).academicFaculty;

        if (academicFacultyId) { 
            // Check if faculty exists (recommended)
            const AcademicFacultyModel = model('AcademicFaculty');
            const facultyExists = await AcademicFacultyModel.exists({
                _id: academicFacultyId,
                isDeleted: false 
            });

            if (!facultyExists) {
                throw new Error('Invalid academic faculty reference');
            }
        }

        if ((updateData as any).name && academicFacultyId) {
            //  Check duplicate (exclude self in case of update)
            const existingDept = await model('AcademicDept').exists({
                name: (updateData as any).name,
                academicFaculty: academicFacultyId,
                isDeleted: false,
                _id: { $ne: this.getQuery()._id } 
            });

            if (existingDept) {
                throw new Error('A department with the same name already exists within the same faculty');
            }
        }
       
    } catch (error) {
        throw new Error('Invalid academic faculty reference');

    }
});
const AcademicDeptModel = model<AcademicDept>('AcademicDept', academicDeptSchema);
export default AcademicDeptModel;