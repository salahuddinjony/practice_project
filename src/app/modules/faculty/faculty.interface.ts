import { Types } from "mongoose";
import { userName } from "../student/student.interface.js";

export type Faculty = {
  id: string;
  user: Types.ObjectId;
  name: userName;
  email: string;
  experience: number;
  designation: string;
  contactNo: string;
  emergencyContactNo: string;
  profileImage?: string;
  gender: "male" | "female" | "other";
  dateOfBirth: Date;
  bloodGroup?:
    | "A+"
    | "A-"
    | "B+"
    | "B-"
    | "AB+"
    | "AB-"
    | "O+"
    | "O-"
    | undefined;
  presentAddress: string;
  permanentAddress: string;
  isDeleted?: boolean;
};
