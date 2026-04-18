import AppError from "../errors/handleAppError.js";
import type { offeredCourse } from "../modules/offeredCourse/offeredCourse.interface.js";
import { OfferedCourseModel } from "../modules/offeredCourse/offeredCourse.model.js";

export type SemesterRegistrationWindow = {
  startDate: Date;
  endDate: Date;
};

export const isDateRangeOverlapped = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) => startA <= endB && endA >= startB;

export const assertOfferedCourseDatesWithinSemester = (
  startDate: Date,
  endDate: Date,
  semesterReg: SemesterRegistrationWindow,
) => {
  if (endDate <= startDate) {
    throw new AppError("End Date must be after Start Date", 400);
  }
  if (startDate < semesterReg.startDate || endDate > semesterReg.endDate) {
    throw new AppError(
      "Offered course dates must be within the semester registration period",
      400,
    );
  }
};

export type FacultyScheduleConflictParams = {
  semseterRegistration: offeredCourse["semseterRegistration"];
  faculty: offeredCourse["faculty"];
  startDate: Date;
  endDate: Date;
  days: offeredCourse["days"];
  excludeOfferedCourseId?: string;
};

export const assertNoFacultyScheduleConflict = async (
  params: FacultyScheduleConflictParams,
) => {
  const {
    semseterRegistration,
    faculty,
    startDate,
    endDate,
    days,
    excludeOfferedCourseId,
  } = params;

  const facultyOfferedCourses = await OfferedCourseModel.find({
    semseterRegistration,
    faculty,
    isDeleted: false,
    ...(excludeOfferedCourseId ? { _id: { $ne: excludeOfferedCourseId } } : {}),
  }).select("startDate endDate days");

  const hasFacultyScheduleConflict = facultyOfferedCourses.some((course) => {
    const hasDayOverlap = days.some((day) => course.days.includes(day));
    const hasDateOverlap = isDateRangeOverlapped(
      startDate,
      endDate,
      course.startDate,
      course.endDate,
    );
    return hasDayOverlap && hasDateOverlap;
  });

  if (hasFacultyScheduleConflict) {
    throw new AppError(
      "Faculty already has an offered course in the same date range and day(s)",
      400,
    );
  }
};
