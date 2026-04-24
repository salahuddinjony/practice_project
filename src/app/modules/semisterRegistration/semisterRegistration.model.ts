import { model, Schema } from 'mongoose';
import { SemesterRegistration } from './semisterRegistration.interface.js';
import { applyExcludeFields } from '../../utils/excludeFiledWhenCreateResponse.js';


const SemesterRegistrationSchema = new Schema<SemesterRegistration>({
    academicSemester: {
        type: Schema.Types.ObjectId,
        ref: 'AcademicSemester',
        required: true,
    },
    status: {
        type: String,
        enum: ['UPCOMING', 'ONGOING', 'COMPLETED'],
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    minCredit: {
        type: Number,
        required: true,
    },
    maxCredit: {
        type: Number,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false,
    },
}, {
    timestamps: true,
    versionKey: false, 
});


// Exclude password and isDeleted fields when converting to JSON
applyExcludeFields<SemesterRegistration>(SemesterRegistrationSchema, ["isDeleted"]);
const SemesterRegistrationModel = model<SemesterRegistration>('SemesterRegistration', SemesterRegistrationSchema);

export default SemesterRegistrationModel;