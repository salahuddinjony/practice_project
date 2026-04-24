import { model, Schema } from "mongoose";
import { assignCourcesToFaculties, Course, prerequisiteCourse } from "./cources.interface.js";
import { restrictUpdateFieldsChecker } from "../../utils/restrictedUpdateFiled.js";
import { applyExcludeFields } from "../../utils/excludeFiledWhenCreateResponse.js";

const preRequisiteCourseSchema = new Schema<prerequisiteCourse>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { _id: false },
); // Set _id to false to prevent creating an _id for each subdocument

const CourseSchema = new Schema<Course>({
  title: {
    type: String,
    trim: true,
    unique: true,
    required: [true, "Title is required"],
  },
  prefix: { type: String, trim: true, required: [true, "Prefix is required"] },
  code: { type: String, trim: true, required: [true, "Code is required"] },
  credit: { type: Number, trim: true, required: [true, "Credit is required"] },
  prerequisiteCources: [preRequisiteCourseSchema], // Array of prerequisite courses
  isDeleted: { type: Boolean, default: false, select: false }, // Soft delete field
},
{
  timestamps: true,
  virtuals: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
  versionKey: false,
}
);

const assignCourcesToFacultiesSchema = new Schema<assignCourcesToFaculties>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, unique: true },
    faculties: { type: [Schema.Types.ObjectId], ref: "AcademicFaculty", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Exclude fields when converting to JSON
applyExcludeFields<Course>(CourseSchema, [
  "isDeleted",
  "prerequisiteCources.isDeleted",
]);

// restrictUpdateFieldsChecker(CourseSchema, undefined, ["isDeleted"]); // This will restrict updating the isDeleted and email fields in the Student schema for the specified update methods.

export const CourseModel = model<Course>("Course", CourseSchema);
export const AssignCourcesToFacultiesModel = model<assignCourcesToFaculties>("AssignCourcesToFaculties", assignCourcesToFacultiesSchema);