import { Types } from "mongoose";
import { guradian, userName } from "../student/student.interface.js";

export type Admin = {
  id: string;
  user: Types.ObjectId; // Reference to the User document, this will store the ObjectId of the associated user document in the database, allowing us to establish a relationship between the student and the user.
  name: userName;
  gender: "male" | "female" | "other";
  dateOfBirth: Date;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
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
  profileImage?: string | undefined;
  isDeleted?: boolean; // Optional field to indicate if the admin is deleted
};
