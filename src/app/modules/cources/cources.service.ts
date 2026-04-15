import mongoose from "mongoose";
import { paginate, parseListQuery } from "../../builder/queryBuilder.js";
import AppError from "../../errors/handleAppError.js";
import { buildNestedPopulate } from "../../utils/buildNestedPopulate.js";
import { normalizeMongoUpdatePayload } from "../../utils/mongoPartialUpdate.js";
import { assignCourcesToFaculties, Course } from "./cources.interface.js";
import { AssignCourcesToFacultiesModel, CourseModel } from "./cources.model.js";
import AcademicFacultyModel from "../academiFaculty/academicFaculty.model.js";

//create course
const createCourseIntoDB = async (course: Course) => {
  const existingCourse = await CourseModel.findOne({
    title: course.title,
    isDeleted: false,
    code: course.code,
  });

  if (existingCourse) {
    throw new AppError("Course already exists", 400);
  }

  const prerequisiteCourses = course?.prerequisiteCources;

  if (prerequisiteCourses?.length) {
    const invalidIds = prerequisiteCourses.filter(
      (item) => !mongoose.Types.ObjectId.isValid(item.course?.toString()),
    );

    if (invalidIds.length) {
      throw new AppError("Invalid prerequisite course ids", 400);
    }

    // check existence in DB-convert to array
    const ids = prerequisiteCourses.map((p) => p.course);

    const existing = await CourseModel.find({
      _id: { $in: ids },
    });

    if (existing.length !== ids.length) {
      throw new AppError("Some prerequisite courses do not exist", 400);
    }
  }

  return await CourseModel.create(course);
};

//get all courses
const getAllCourcesFromDB = async (query: Record<string, unknown> = {}) => {
  const parsed = parseListQuery(query, {
    searchableFields: ["title", "prefix"],
  });
  const { meta, data: courses } = await paginate(CourseModel, parsed, (q) =>
    q.populate(buildNestedPopulate("prerequisiteCources.course", 3)),
  );
  return { meta, courses };
};

//get single course by id
const getSingleCourseByIdFromDB = async (id: string) => {
  const course = await CourseModel.findById({
    _id: id,
    isDeleted: false,
  }).populate(buildNestedPopulate("prerequisiteCources.course", 3));
  return course;
};

//update course by id
const updateCourseByIdInDB = async (
  id: string,
  updatedData: Partial<Course>,
) => {
  const { prerequisiteCources, ...remainingData } = updatedData;
  //before updating check its deleted or not if not then update it and also check if the updated name is unique or not
  const updateDoc: Record<string, unknown> = {};

  const setData = normalizeMongoUpdatePayload(
    remainingData as Record<string, unknown>,
  );
  if (Object.keys(setData).length > 0) {
    updateDoc.$set = setData;
  }

  if (prerequisiteCources?.length) {
    const invalidIds = prerequisiteCources.filter(
      (item) => !mongoose.Types.ObjectId.isValid(item.course?.toString()),
    );

    if (invalidIds.length) {
      throw new AppError("Invalid prerequisite course ids", 400);
    }

    const selfIncluded = prerequisiteCources.some(
      (item) => item.course.toString() === id,
    );

    if (selfIncluded) {
      throw new AppError("A course cannot be prerequisite of itself", 400);
    }

    const toDeleteIds = prerequisiteCources
      .filter((item) => item.isDeleted)
      .map((item) => item.course.toString());

    const toAddRaw = prerequisiteCources.filter((item) => !item.isDeleted);
    const seen = new Set<string>();
    const toAdd = toAddRaw.filter((item) => {
      const key = item.course.toString();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    if (toAdd.length > 0) {
      const toAddIds = toAdd.map(
        (item) => new mongoose.Types.ObjectId(item.course.toString()),
      );
      const existing = await CourseModel.find(
        { _id: { $in: toAddIds }, isDeleted: false },
        { _id: 1 },
      );

      if (existing.length !== toAddIds.length) {
        throw new AppError("Some prerequisite courses do not exist", 400);
      }
    }

    if (toDeleteIds.length > 0) {
      updateDoc.$pull = {
        prerequisiteCources: {
          course: {
            $in: toDeleteIds.map((value) => new mongoose.Types.ObjectId(value)),
          },
        },
      };
    }

    if (toAdd.length > 0) {
      updateDoc.$addToSet = {
        prerequisiteCources: {
          $each: toAdd.map((item) => ({
            course: new mongoose.Types.ObjectId(item.course.toString()),
            isDeleted: false,
          })),
        },
      };
    }
  }

  // if no fields are updated then return the course with the same id and isDeleted false
  if (Object.keys(updateDoc).length === 0) {
    return await CourseModel.findOne({ _id: id, isDeleted: false });
  }

  const updatedCourse = await CourseModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    updateDoc,
    { returnDocument: "after" },
  );
  return updatedCourse;
};

//delete course by id
const deleteCourseByIdInDB = async (id: string) => {
  const deletedCourse = await CourseModel.findByIdAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: "after" },
  );
  return deletedCourse;
};

//assign cources to faculties
const assignCourcesToFacultiesInDB = async (
  courseId: string,
  facultyData: Partial<assignCourcesToFaculties>,
) => {
  const course = await CourseModel.findOne({
    _id: courseId,
    isDeleted: false,
  }).select("_id");

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const facultyIds = facultyData.faculties;

  if (!facultyIds || facultyIds.length === 0) {
    throw new AppError("Faculty IDs are required", 400);
  }

  const invalidIds = facultyIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id.toString()),
  );

  if (invalidIds.length) {
    throw new AppError("Invalid faculty IDs", 400);
  }

  const uniqueFacultyIds = [
    ...new Set(facultyIds.map((id) => id.toString())),
  ].map((id) => new mongoose.Types.ObjectId(id));

  const faculties = await AcademicFacultyModel.find({
    _id: { $in: uniqueFacultyIds },
    isDeleted: false,
  });

  if (faculties.length !== uniqueFacultyIds.length) {
    throw new AppError("Some faculties are deleted or invalid", 400);
  }

  const assignedCources = await AssignCourcesToFacultiesModel.findOneAndUpdate(
    { courseId: new mongoose.Types.ObjectId(courseId) },
    {
      $setOnInsert: { courseId: new mongoose.Types.ObjectId(courseId) },
      $addToSet: { faculties: { $each: uniqueFacultyIds } },
    },
    { upsert: true, returnDocument: "after" },
  );

  return assignedCources;
};

// unassign cources from faculties
const unassignCourcesFromFacultiesInDB = async (
  courseId: string,
  facultyIds: string[],
) => {
  if (!Array.isArray(facultyIds) || facultyIds.length === 0) {
    throw new AppError("Faculty IDs are required", 400);
  }
  const invalidIds = facultyIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id.toString()),
  );
  if (invalidIds.length) {
    throw new AppError("Invalid faculty IDs", 400);
  }
  const uniqueFacultyIds = [
    ...new Set(facultyIds.map((id) => id.toString())),
  ].map((id) => new mongoose.Types.ObjectId(id));
  const faculties = await AcademicFacultyModel.find({
    _id: { $in: uniqueFacultyIds },
    isDeleted: false,
  });
  if (faculties.length !== uniqueFacultyIds.length) {
    throw new AppError("Some faculties are deleted or invalid", 400);
  }

  const unassignedCources =
    await AssignCourcesToFacultiesModel.findOneAndUpdate(
      { courseId: new mongoose.Types.ObjectId(courseId) },
      { $pull: { faculties: { $in: uniqueFacultyIds } } },
      { returnDocument: "after" },
    );
  if (!unassignedCources) {
    throw new AppError("No faculty assignments found for this course", 404);
  }
  return unassignedCources;
};

// get all assigned course-faculty mappings
const getAllCoursesAssignedToFacultiesInDB = async () => {
  const courses = await AssignCourcesToFacultiesModel.find({})
    .populate("courseId")
    .populate("faculties");
  return courses;
};

// get courses assigned to a faculty
const getSingleAssignedCourseToFacultyInDB = async (facultyId: string) => {
  const course = await AssignCourcesToFacultiesModel.findOne({
    faculties: { $in: [new mongoose.Types.ObjectId(facultyId)] },
  })
    .sort({ updatedAt: -1 })
    .populate("courseId")
    .populate("faculties");
  return course;
};

export const CourseService = {
  createCourseIntoDB,
  getAllCourcesFromDB,
  getSingleCourseByIdFromDB,
  updateCourseByIdInDB,
  deleteCourseByIdInDB,
  assignCourcesToFacultiesInDB,
  unassignCourcesFromFacultiesInDB,
  getAllCoursesAssignedToFacultiesInDB,
  getSingleAssignedCourseToFacultyInDB,
};
