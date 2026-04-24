import { ClientSession, Types } from "mongoose";
import config from "../../config/index.js";
import AppError from "../../errors/handleAppError.js";
import { AcademicSemesterModel } from "../academicSemester/academicSemester.model.js";
import { CounterService } from "../counter/counter.service.js";
import { UserRoleEnum, UserRoleType } from "./user.interface.js";
import { UserRole } from "./user.constant.js";

const padSequence = (value: number) => value.toString().padStart(4, "0");

/**
 * Generates a unique user id for students (from admission semester + sequence),
 * faculty, or admin (year-scoped counter + sequence). Student ids keep the
 * existing `{year}{semesterCode}{seq4}` shape; faculty/admin use `FAC{year}{seq4}` / `ADM{year}{seq4}`.
 */
const generateUserId = async (
  role: UserRoleEnum,
  session?: ClientSession,
  admissionSemesterId?: string,
): Promise<string> => {
  if (role === UserRole.STUDENT) {
    const normalizedSemesterId = admissionSemesterId?.trim();

    if (
      !normalizedSemesterId ||
      !Types.ObjectId.isValid(normalizedSemesterId)
    ) {
      throw new AppError("Invalid admission semester id", 400);
    }

    const semesterData = await AcademicSemesterModel.findOne({
      _id: normalizedSemesterId,
      isDeleted: false,
    }).session(session ?? null);
    if (!semesterData) {
      throw new AppError("Admission semester not found", 404);
    }
    const yearValue =
      semesterData.year instanceof Date
        ? semesterData.year.getFullYear().toString()
        : new Date(semesterData.year).getFullYear().toString();

    if (!yearValue || yearValue === "NaN") {
      throw new AppError("Invalid semester year", 500);
    }

    const counterId = `${yearValue}${semesterData.code}`;
    const getCounterData = await CounterService.createOrFindCounterIntoDB(
      counterId,
      "student",
      session,
    );
    if (!getCounterData) {
      throw new AppError("Failed to generate counter data", 500);
    }
    return `${counterId}${padSequence(getCounterData.sequenceValue)}`;
  }

  const year = new Date().getFullYear().toString();
  const counterKey = role === "faculty" ? `FAC${year}` : `ADM${year}`;
  const getCounterData = await CounterService.createOrFindCounterIntoDB(
    counterKey,
    role,
    session,
  );
  if (!getCounterData) {
    throw new AppError("Failed to generate counter data", 500);
  }
  return `${counterKey}${padSequence(getCounterData.sequenceValue)}`;
};

const resolveNewUserPassword = (password: string | undefined) => {
  const trimmed = typeof password === "string" ? password.trim() : "";
  if (trimmed === "") {
    return {
      password: config.DEFAULT_USER_PASSWORD,
      needsPasswordReset: true,
    };
  }
  return { password: trimmed, needsPasswordReset: false };
};

export const UserUtils = {
  generateUserId,
  resolveNewUserPassword,
};
