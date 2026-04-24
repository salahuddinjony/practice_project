import AppError from "../../errors/handleAppError.js";
import { paginate, parseListQuery } from "../../builder/queryBuilder.js";
import { normalizeMongoUpdatePayload } from "../../utils/mongoPartialUpdate.js";
import { Faculty } from "./faculty.interface.js";
import { FacultyModel } from "./faculty.model.js";
import mongoose from "mongoose";
import { UserModel } from "../user/user.model.js";

// const createFacultyIntoDB = async (facultyData: Faculty) => {
//   const existing = await FacultyModel.findOne({
//     name: facultyData.name,
//     isDeleted: false,
//   });

//   if (existing) {
//     throw new AppError("Faculty already exists", 400);
//   }

//   return await FacultyModel.create(facultyData);
// };

const getAllFacultiesFromDB = async (query: Record<string, unknown> = {}) => {
  const parsed = parseListQuery(query, {
    searchableFields: ["name"],
    baseFilter: { isDeleted: false },
  });

  const { meta, data } = await paginate(FacultyModel, parsed,(q) =>
    q.populate("user"));
  return { meta, faculties: data };
};

const getFacultyByIdFromDB = async (id: string) => {
  return await FacultyModel.findOne({ _id: id, isDeleted: false });
};

const updateFacultyByIdInDB = async (
  id: string,
  updatedData: Partial<Omit<Faculty, "id">>,
) => {
  const existing = await FacultyModel.findOne({ _id: id, isDeleted: false });
  if (!existing) return null;

  return await FacultyModel.findByIdAndUpdate(
    id,
    normalizeMongoUpdatePayload(updatedData as Record<string, unknown>),
    { returnDocument: "after" },
  );
};

const deleteFacultyByIdInDB = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const deletedFaculty = await FacultyModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { returnDocument: "after", session },
    );
    if (!deletedFaculty) {
      await session.abortTransaction();
      return null;
    }
    await UserModel.findByIdAndUpdate(
      deletedFaculty.user,
      { isDeleted: true },
      { session },
    );
    await session.commitTransaction();
    return deletedFaculty;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const FacultyService = {
  getAllFacultiesFromDB,
  getFacultyByIdFromDB,
  updateFacultyByIdInDB,
  deleteFacultyByIdInDB,
};
