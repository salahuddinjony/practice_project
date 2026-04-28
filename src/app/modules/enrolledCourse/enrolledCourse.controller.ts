import { NextFunction, Request, Response } from "express";
import AppError from "../../errors/handleAppError.js";
import sendResponse from "../../utils/response/responseSend.js";
import catchAsync from "../../utils/CatchAsync.js";
import { checkCommonValidation } from "../../utils/checkCommonValidation.js";
import { EnrolledCourseService } from "./enrolledCourse.service.js";
import { UserRole } from "../user/user.constant.js";

const createEnrolledCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log("User from the token", req.user);
    const userId = req.user?._id;
    const enrolledCourseData = req.body; // Get course data from the request body

    const result = await EnrolledCourseService.createEnrolledCourseIntoDB(
      userId as string,
      enrolledCourseData,
    );

    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Course enrolled successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to enroll course", 404));
    }
  },
);

// get all users-GET
const getAllEnrolledCourses = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result =
      await EnrolledCourseService.getAllEnrolledCoursesFromDB(query);
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Enrolled courses retrieved successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to retrieve enrolled courses", 404));
    }
  },
);

// get user by ID-GET
const getEnrolledCourseById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = checkCommonValidation.validateId(
      req.params.id as string,
      next,
    );

    const result = await EnrolledCourseService.getEnrolledCourseByIdFromDB(
      courseId as string,
    );
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Enrolled course retrieved successfully",
        data: result,
      });
    } else {
      next(new AppError("Enrolled course not found", 404));
    }
  },
);

//get my enrolled courses
const getMyEnrolledCourses = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user?.role !== UserRole.STUDENT) {
      return next(
        new AppError("You are not authorized to access this resource", 403),
      );
    }
    const result = await EnrolledCourseService.getMyEnrolledCoursesFromDB(user);
    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "My enrolled courses retrieved successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to retrieve my enrolled courses", 404));
    }
  },
);
// update user info-PUT
const updateEnrolledCourseById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const enrolledCourseId = checkCommonValidation.validateId(
      req.params.id as string,
      next,
    );

    const updatedData = req.body; // Get updated course data from the request body
    const result = await EnrolledCourseService.updateEnrolledCourseByIdInDB(
      enrolledCourseId as string,
      updatedData,
    );
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Enrolled course updated successfully",
        data: result,
      });
    } else {
      next(new AppError("Enrolled course not found", 404));
    }
  },
);

// delete user-DELETE
const deleteEnrolledCourseById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = checkCommonValidation.validateId(
      req.params.id as string,
      next,
    );
    const result = await EnrolledCourseService.deleteEnrolledCourseByIdFromDB(
      courseId as string,
    );
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Enrolled course deleted successfully",
        data: result,
      });
    } else {
      next(new AppError("Enrolled course not found", 404));
    }
  },
);

export const EnrolledCourseController = {
  createEnrolledCourse,
  getAllEnrolledCourses,
  getEnrolledCourseById,
  getMyEnrolledCourses,
  updateEnrolledCourseById,
  deleteEnrolledCourseById,
};
