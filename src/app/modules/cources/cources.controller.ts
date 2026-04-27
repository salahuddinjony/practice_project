import { NextFunction, Request, Response } from "express";
import AppError from "../../errors/handleAppError.js";
import sendResponse from "../../utils/response/responseSend.js";
import catchAsync from "../../utils/CatchAsync.js";
import { checkCommonValidation } from "../../utils/checkCommonValidation.js";
import { CourseService } from "./cources.service.js";

const createCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseData = req.body; // Get course data from the request body

    const result = await CourseService.createCourseIntoDB(courseData);

    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Course created successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to create course", 404));
    }
  },
);

// get all users-GET
const getAllCources = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await CourseService.getAllCourcesFromDB(query);
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Courses retrieved successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to retrieve users", 404));
    }
  },
);

// get user by ID-GET
const getCourseById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = checkCommonValidation.validateId(
      req.params.id as string,
      next,
    );

    const result = await CourseService.getSingleCourseByIdFromDB(
      courseId as string,
    );
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Course retrieved successfully",
        data: result,
      });
    } else {
      next(new AppError("Course not found", 404));
    }
  },
);

// update user info-PUT
const updateCourseInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = checkCommonValidation.validateId(
      req.params.id as string,
      next,
    );
    const updatedData = req.body; // Get updated course data from the request body
    const result = await CourseService.updateCourseByIdInDB(
      courseId as string,
      updatedData,
    );
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Course updated successfully",
        data: result,
      });
    } else {
      next(new AppError("Course not found", 404));
    }
  },
);

// delete user-DELETE
const deleteCourseById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = checkCommonValidation.validateId(
      req.params.id as string,
      next,
    );
    const result = await CourseService.deleteCourseByIdInDB(courseId as string);
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Course deleted successfully",
        data: result,
      });
    } else {
      next(new AppError("Course not found", 404));
    }
  },
);

//assign cources to faculties
const assignCourcesToFaculties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = checkCommonValidation.validateId(
      req.params.courseId as string,
      next,
    );
    const facultyData = req.body;
    const result = await CourseService.assignCourcesToFacultiesInDB(
      courseId as string,
      facultyData,
    );
    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Courses assigned to faculties successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to assign courses to faculties", 404));
    }
  },
);

// get all assigned faculty By course id
const getAssignedFacultyByCourseId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = checkCommonValidation.validateId(
      req.params.courseId as string,
      next,
    );
    const result = await CourseService.getAssignedFacultyByCourseIdInDB(
      courseId as string,
    );
    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Assigned faculties retrieved successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to get assigned faculties", 404));
    }
  },
);


// unassign cources from faculties
const unassignCourcesFromFaculties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = checkCommonValidation.validateId(
      req.params.courseId as string,
      next,
    );
    const facultyIds = Array.isArray(req.body) ? req.body : req.body.faculties;
    const result = await CourseService.unassignCourcesFromFacultiesInDB(
      courseId as string,
      facultyIds,
    );
    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Courses unassigned from faculties successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to unassign courses from faculties", 404));
    }
  },
);

// get all assigned courses with faculties
const getAllCoursesAssignedToFaculty = catchAsync(
  async (_req: Request, res: Response, next: NextFunction) => {
    const result = await CourseService.getAllCoursesAssignedToFacultiesInDB();
    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All assigned courses retrieved successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to get all assigned courses", 404));
    }
  },
);

// get single assigned course to a faculty
const getSingleAssignedCourseToFaculty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const facultyId = checkCommonValidation.validateId(
      req.params.facultyId as string,
      next,
    );
    const result = await CourseService.getSingleAssignedCourseToFacultyInDB(
      facultyId as string,
    );
    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Courses assigned to faculty successfully",
        data: result,
      });
    } else {
      next(new AppError("No assigned course found for this faculty", 404));
    }
  },
);

export const CourseController = {
  createCource: createCourse,
  getAllCources,
  getCourseById,
  updateCourseInfo,
  deleteCourseById,
  assignCourcesToFaculties,
  unassignCourcesFromFaculties,
  getAllCoursesAssignedToFaculty,
  getSingleAssignedCourseToFaculty,
  getAssignedFacultyByCourseId,
};
