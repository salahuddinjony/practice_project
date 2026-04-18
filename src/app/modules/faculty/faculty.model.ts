import { Schema, model } from "mongoose";
import { Faculty } from "./faculty.interface.js";
import { applyExcludeFields } from "../../utils/excludeFiledWhenCreateResponse.js";

const facultySchema = new Schema<Faculty>(
  {
    name: {
      type: String,
      required: [true, "Faculty name is required"],
      unique: [true, "Faculty name must be unique"],
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Exclude password and isDeleted fields when converting to JSON
applyExcludeFields<Faculty>(facultySchema, ["isDeleted"]);
export const FacultyModel = model<Faculty>("Faculty", facultySchema);
