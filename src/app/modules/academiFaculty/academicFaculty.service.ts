import AcademicDeptModel from "../academicDept/academicDept.model.js";
import { AcademicFaculty } from "./academicFaculty.interface.js";
import AcademicFacultyModel from "./academicFaculty.model.js";
import mongoose from "mongoose";
import AppError from "../../errors/handleAppError.js";
import { StudentModel } from "../student/student.model.js";
import { paginate, parseListQuery } from "../../builder/queryBuilder.js";
import { normalizeMongoUpdatePayload } from "../../utils/mongoPartialUpdate.js";
import { CounterService } from "../counter/counter.service.js";

// Service function to create a new academic faculty
const createAcademicFacultyIntoDB = async (facultyData: AcademicFaculty) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const startFacultyId = "F-";

    const facultyIdCounter = await CounterService.createOrFindCounterIntoDB(
      startFacultyId,
      "academicFaculty",
      session,
    );

    if (!facultyIdCounter) {
      await session.abortTransaction();
      throw new AppError("Failed to generate academic faculty id", 500);
    }

    const facultyId = `${startFacultyId}${facultyIdCounter.sequenceValue
      .toString()
      .padStart(4, "0")}`;

    facultyData.facultyId = facultyId;
    const [faculty] = await AcademicFacultyModel.create([facultyData], {
      session,
    });

    await session.commitTransaction();

    return faculty;
  } catch (error: any) {
    await session.abortTransaction();

    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to create academic faculty", 500);
  } finally {
    await session.endSession();
  }
};

// Service function to get all academic faculties
export const getAllAcademicFacultiesFromDB = async (
  query: Record<string, unknown> = {},
) => {
  const parsed = parseListQuery(query, {
    searchableFields: ["name"],
    baseFilter: { isDeleted: false },
  });
  const { meta, data } = await paginate(AcademicFacultyModel, parsed);
  return { meta, data };
};

// get single faculty by id
const getAcademicFacultyByIdFromDB = async (id: string) => {
  const faculty = await AcademicFacultyModel.findById(id);
  return faculty;
};

// update faculty info
const updateAcademicFacultyInfoInDB = async (
  id: string,
  updatedData: Partial<Omit<AcademicFaculty, "id">>,
) => {
  //before updating check its deleted or not if not then update it and also check if the updated name is unique or not
  const existingFaculty = await AcademicFacultyModel.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!existingFaculty) {
    return null; // No faculty found with the specified ID or it is already deleted
  }
  const updatedFaculty = await AcademicFacultyModel.findByIdAndUpdate(
    id,
    normalizeMongoUpdatePayload(updatedData as Record<string, unknown>),
    { returnDocument: "after" },
  );
  return updatedFaculty;
};

// delete faculty from database
const deleteAcademicFacultyFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deletedFaculty = await AcademicFacultyModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { returnDocument: "after", session },
    );

    if (!deletedFaculty) {
      await session.abortTransaction();
      return null;
    }

    const departments = await AcademicDeptModel.find({
      academicFaculty: id,
      isDeleted: false,
    }).select("_id");

    const departmentIds = departments.map((dept) => dept._id);

    if (departmentIds.length > 0) {
      await AcademicDeptModel.updateMany(
        { _id: { $in: departmentIds } },
        { isDeleted: true },
        { session },
      );

      await StudentModel.updateMany(
        {
          academicDept: { $in: departmentIds },
          isDeleted: false,
        },
        { isDeleted: true },
        { session },
      );
    }

    await session.commitTransaction();
    return deletedFaculty;
  } catch (error) {
    await session.abortTransaction();
    throw new AppError("Failed to delete academic faculty", 500);
  } finally {
    await session.endSession();
  }
};

// Restore all deleted faculties from the database
const restoreDeletedAcademicFacultiesInDB = async () => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deletedFaculties = await AcademicFacultyModel.find({
      isDeleted: true,
    }).select("_id");

    if (deletedFaculties.length === 0) {
      await session.abortTransaction();
      return null;
    }

    const facultyIds = deletedFaculties.map((f) => f._id);

    await AcademicFacultyModel.updateMany(
      { _id: { $in: facultyIds } },
      { isDeleted: false },
      { session },
    );

    await session.commitTransaction();

    const restoredFaculties = await AcademicFacultyModel.find({
      _id: { $in: facultyIds },
    });

    return restoredFaculties;
  } catch (error) {
    await session.abortTransaction();
    throw new AppError("Failed to restore deleted academic faculties", 500);
  } finally {
    await session.endSession();
  }
};

//get all deleted faculties from database
const getAllDeletedAcademicFacultiesFromDB = async () => {
  const faculties = await AcademicFacultyModel.find({ isDeleted: true });
  if (faculties.length === 0) {
    return null; // No deleted faculties found
  }
  return {
    count: faculties.length,
    faculties: faculties,
  };
};
export const AcademicFacultyService = {
  createAcademicFacultyIntoDB,
  getAllAcademicFacultiesFromDB,
  getAcademicFacultyByIdFromDB,
  updateAcademicFacultyInfoInDB,
  deleteAcademicFacultyFromDB,
  restoreDeletedAcademicFacultiesInDB,
  getAllDeletedAcademicFacultiesFromDB,
};
