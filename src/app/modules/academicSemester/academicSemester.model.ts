import AppError from '../../errors/AppError.js';
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