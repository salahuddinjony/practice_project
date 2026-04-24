import { Schema, model } from "mongoose";
import { Faculty } from "./faculty.interface.js";
import { applyExcludeFields } from "../../utils/excludeFiledWhenCreateResponse.js";
import { userNameSchema } from "../student/student.model.js";

const facultySchema = new Schema<Faculty>(
  {
    id: {
      type: String,
      required: [true, "Faculty ID is required"],
      unique: [true, "Faculty ID must be unique"],
    },
    name: {
      type: userNameSchema,
      required: [true, "Faculty name is required"],
    },
    email: {
      type: String,
      required: [true, "Faculty email is required"],
      unique: [true, "Faculty email must be unique"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Faculty user is required"],
      unique: [true, "Faculty user must be unique"],
    },
    experience: {
      type: Number,
      required: [true, "Faculty experience is required"],
    },
    designation: {
      type: String,
      required: [true, "Faculty designation is required"],
    },
    contactNo: {
      type: String,
      required: [true, "Faculty contact number is required"],
    },
    emergencyContactNo: {
      type: String,
      required: [true, "Faculty emergency contact number is required"],
    },
    profileImage: {
      type: String,
    },
    gender: {
      type: String,
      required: [true, "Faculty gender is required"],
      enum: {
        values: ["male", "female", "other"],
        message: "Faculty gender must be one of male, female, or other",
      },
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Faculty date of birth is required"],
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        message:
          "Faculty blood group must be one of A+, A-, B+, B-, AB+, AB-, O+, or O-",
      },
    },
    presentAddress: {
      type: String,
      required: [true, "Faculty present address is required"],
    },
    permanentAddress: {
      type: String,
      required: [true, "Faculty permanent address is required"],
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
