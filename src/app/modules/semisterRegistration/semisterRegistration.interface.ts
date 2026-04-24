import { Types } from "mongoose";

export type SemesterRegistration = {
  academicSemester: Types.ObjectId; // Reference to AcademicSemester
  status: "UPCOMING" | "ONGOING" | "COMPLETED"; // Status of the semester registration
  startDate: Date;
  endDate: Date;
  minCredit: number;
  maxCredit: number;
  isDeleted?: boolean; // Optional field to indicate if the registration is deleted
};
