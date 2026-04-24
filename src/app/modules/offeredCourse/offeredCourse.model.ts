import { model, Schema } from "mongoose";
import { daysOfWeek, offeredCourse } from "./offeredCourse.interface.js";
import { applyExcludeFields } from "../../utils/excludeFiledWhenCreateResponse.js";

export const daysOfWeekEnum: daysOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const offeredCourseSchema = new Schema<offeredCourse>(
  {
    semseterRegistration: {
      type: Schema.Types.ObjectId,
      ref: "SemesterRegistration",
      required: true,
    },
    // academicSemester: {
    //   type: Schema.Types.ObjectId,
    //   ref: "AcademicSemester",
    //   required: true,
    // },
    // academicFaculty: {
    //   type: Schema.Types.ObjectId,
    //   ref: "AcademicFaculty",
    //   required: true,
    // },
    academicDepartment: {
      type: Schema.Types.ObjectId,
      ref: "AcademicDept",
      required: true,
    },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    faculty: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    maxCapacity: { type: Number, required: true },
    section: { type: String, required: true },
    days: {
      type: [String],
      enum: { values: daysOfWeekEnum, message: "Invalid day of week" },
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
// Exclude password and isDeleted fields when converting to JSON
applyExcludeFields<offeredCourse>(offeredCourseSchema, ["isDeleted"]);
export const OfferedCourseModel = model<offeredCourse>(
  "OfferedCourse",
  offeredCourseSchema,
);
