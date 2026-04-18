import AppError from "../../errors/handleAppError.js";
import { AcademicSemesterModel } from "../academicSemester/academicSemester.model.js";
import { SemesterRegistration } from "./semisterRegistration.interface.js";
import SemesterRegistrationModel from "./semisterRegistration.model.js";
import { paginate, parseListQuery } from "../../builder/queryBuilder.js";
import { normalizeMongoUpdatePayload } from "../../utils/mongoPartialUpdate.js";
import toValidDate from "../../utils/isValidDate.js";
import { SemesterRegistrationStatus } from "./semisterRegistration.constant.js";
import { OfferedCourseModel } from "../offeredCourse/offeredCourse.model.js";
import mongoose from "mongoose";

// create semister registration
const createSemesterRegistrationIntoDB = async (
  semesterRegistration: SemesterRegistration,
) => {
  //1st check this semester id is valid or not
  const isValidAcademicSemesterId = await AcademicSemesterModel.findOne({
    _id: semesterRegistration.academicSemester,
    isDeleted: false,
  });

  if (!isValidAcademicSemesterId) {
    throw new AppError("Invalid academic semester ID", 400);
  }
  const existingSemesterRegistration = await SemesterRegistrationModel.findOne({
    academicSemester: semesterRegistration.academicSemester,
    isDeleted: false,
  });

  if (existingSemesterRegistration) {
    throw new AppError(
      "Semister registration already exists for this academic semester",
      400,
    );
  }
  //then checck is there already any registration status 'UPCOMING' or 'ONGOING' if not then throw an error
  const existingRegistration = await SemesterRegistrationModel.findOne({
    status: { $in: ["UPCOMING", "ONGOING"] },
    isDeleted: false,
  });
  if (existingRegistration) {
    throw new AppError(
      "There are already some registrations in the UPCOMING or ONGOING status",
      400,
    );
  }

  return await SemesterRegistrationModel.create(semesterRegistration);
};

//get all semister registration
const getAllSemesterRegistrationFromDB = async (
  query: Record<string, unknown> = {},
) => {
  const parsed = parseListQuery(query, {
    searchableFields: ["status"],
    baseFilter: { isDeleted: false },
  });
  const { meta, data: semesterRegistrations } = await paginate(
    SemesterRegistrationModel,
    parsed,
    (q) => q.populate("academicSemester"),
  );
  return { meta, semesterRegistrations };
};

// get single semister registration by id
const getSemesterRegistrationByIdFromDB = async (id: string) => {
  const result = await SemesterRegistrationModel.findOne({
    _id: id,
    isDeleted: false,
  }).populate("academicSemester");
  return result;
};

// update semister registration info
const updateSemesterRegistrationInfoInDB = async (
  id: string,
  updatedData: Partial<Omit<SemesterRegistration, "id">>,
) => {
  const existing = await SemesterRegistrationModel.findById(id);

  if (!existing || existing.isDeleted) {
    throw new AppError("Semester registration not found", 404);
  }

  // Date validation (merge old + new)
  if (
    updatedData.startDate !== undefined ||
    updatedData.endDate !== undefined
  ) {
    const nextStart = toValidDate(updatedData.startDate ?? existing.startDate);
    const nextEnd = toValidDate(updatedData.endDate ?? existing.endDate);

    if (!nextStart || !nextEnd) {
      throw new AppError("Invalid startDate or endDate", 400);
    }

    if (nextEnd <= nextStart) {
      throw new AppError("End Date must be after Start Date", 400);
    }
  }

  // Academic semester validation
  if (updatedData.academicSemester) {
    const isValid = await AcademicSemesterModel.exists({
      _id: updatedData.academicSemester,
      isDeleted: false,
    });

    if (!isValid) {
      throw new AppError("Invalid academic semester ID", 400);
    }
  }

  // Status transition control
  const statuses = ["UPCOMING", "ONGOING", "COMPLETED"] as const;

  if (updatedData.status) {
    const currentIndex = statuses.indexOf(existing.status);
    const newIndex = statuses.indexOf(updatedData.status);

    if (newIndex === -1) {
      throw new AppError("Invalid status", 400);
    }

    if (newIndex < currentIndex) {
      throw new AppError("Status cannot be reverted to a previous stage", 400);
    }
  }

  // Update semester registration with validation
  const updated = await SemesterRegistrationModel.findByIdAndUpdate(
    id,
    normalizeMongoUpdatePayload(updatedData as Record<string, unknown>),
    {
      new: true, // cleaner than returnDocument
      runValidators: true,
    },
  );

  return updated;
};

//delete semister registration by id
const deleteSemesterRegistrationFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const semesterRegistration = await SemesterRegistrationModel.findOne({
      _id: id,
      isDeleted: false,
    }).session(session);

    if (!semesterRegistration) {
      throw new AppError("Semester registration not found", 404);
    }

    if (semesterRegistration.status !== SemesterRegistrationStatus.UPCOMING) {
      throw new AppError(
        "Semester registration is not upcoming, you can't delete it",
        400,
      );
    }

    await OfferedCourseModel.updateMany(
      {
        semesterRegistration: semesterRegistration._id,
        isDeleted: false,
      },
      { isDeleted: true },
      { session },
    );

    const result = await SemesterRegistrationModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { returnDocument: "after", session },
    );

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
export const SemesterRegistrationService = {
  createSemesterRegistrationIntoDB,
  getAllSemesterRegistrationFromDB,
  getSemesterRegistrationByIdFromDB,
  updateSemesterRegistrationInfoInDB,
  deleteSemesterRegistrationFromDB,
};
