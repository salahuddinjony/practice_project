import { Types } from "mongoose";

export type prerequisiteCourse = {
  course: Types.ObjectId; // ObjectId referencing another course
  isDeleted: boolean;
};

export type Course = {
  title: string;
  prefix: string;
  code: string;
  credit: number;
  prerequisiteCources?: prerequisiteCourse[]; // Array of prerequisite courses
  isDeleted?: boolean; // Optional field to indicate if the course is deleted
};

export type assignCourcesToFaculties = {
  courseId: Types.ObjectId;
  faculties: Types.ObjectId[];
};
