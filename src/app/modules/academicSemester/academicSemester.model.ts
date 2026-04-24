import AppError from '../../errors/handleAppError.js';
import { applyExcludeFields } from '../../utils/excludeFiledWhenCreateResponse.js';
import { restrictUpdateFieldsChecker } from '../../utils/restrictedUpdateFiled.js';
import { monthEnum, semesterCodeEnum, semesterNameEnum } from './academicSemester.constant.js';
import { AcademicSemester } from './academicSemester.interface.js';
import { Schema, model } from 'mongoose';

const AcademicSemesterSchema = new Schema<AcademicSemester>({
    name: {
        type: String,
        required: [true, 'Academic semester name is required'],
        enum: {
            values: semesterNameEnum,
            message: "Name must be 'Autumn', 'Summer', or 'Fall'"
        }
    },
    code: {
        type: String,
        required: [true, 'Academic semester code is required'],
        enum: {
            values: semesterCodeEnum,
            message: "Code must be '01', '02', or '03'"
        }
    },
    year: {
        type: Date,
        required: [true, 'Year is required']
    },
    startMonth: {
        type: String,
        required: [true, 'Start month is required'],
        enum: {
            values: monthEnum,
            message: "Start month is invalid"
        }
    },
    endMonth: {
        type: String,
        required: [true, 'End month is required'],
        enum: {
            values: monthEnum,
            message: "End month is invalid"
        }
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false
    }
}, {
    timestamps: true
});
// Exclude password and isDeleted fields when converting to JSON
applyExcludeFields<AcademicSemester>(AcademicSemesterSchema, ['isDeleted']);

// pre hook to restrict updating the isDeleted field in the AcademicSemester schema for the specified update methods.
// restrictUpdateFieldsChecker(AcademicSemesterSchema, undefined, ["isDeleted"]); // This will restrict updating the isDeleted field in the AcademicSemester schema for the specified update methods.


// pree hook to check if the semester with the same name and year already exists before saving a new semester
AcademicSemesterSchema.pre('save', async function () {
    const existingSemester = await AcademicSemesterModel.findOne({
        name: this.name,
        isDeleted: false,
        $expr: {
            $eq: [{ $year: "$year" }, this.year.getFullYear()]
        }
    });
    if (existingSemester) {
        throw new Error('Academic semester with the same name and year already exists');
    }
});
export const AcademicSemesterModel = model<AcademicSemester>('AcademicSemester', AcademicSemesterSchema);