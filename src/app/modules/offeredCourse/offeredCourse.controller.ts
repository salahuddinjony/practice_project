import { NextFunction, Request, Response } from "express";
import AppError from "../../errors/handleAppError.js";
import sendResponse from "../../utils/response/responseSend.js";
import catchAsync from "../../utils/CatchAsync.js";
import { checkCommonValidation } from "../../utils/checkCommonValidation.js";
import { OfferedCourseService } from "./offeredCourse.service.js";

const createOfferedCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const offeredCourseData = req.body; // Get course data from the request body

    const result =
      await OfferedCourseService.createOfferedCourseIntoDB(offeredCourseData);

    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Offered course created successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to create offered course", 404));
    }
  },
);

// get all users-GET
const getMyOfferedCourses = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    console.log("user", user); 

    const query = req.query;
    const result = await OfferedCourseService.getMyOfferedCoursesFromDB(query, user);
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Offered courses retrieved successfully",
        data: result,
      });
    } else {
      next(new AppError("Failed to retrieve offered courses", 404));
    }
  },
);

// get user by ID-GET
const getOfferedCourseById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = checkCommonValidation.validateId(
      req.params.id as string,
      next,
    );

    const result = await OfferedCourseService.getSingleOfferedCourseByIdFromDB(
      courseId as string,
    );
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Offered course retrieved successfully",
        data: result,
      });
    } else {
      next(new AppError("Offered course not found", 404));
    }
  },
);

// update user info-PUT
const updateOfferedCourseInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = checkCommonValidation.validateId(
      req.params.id as string,
      next,
    );
    const updatedData = req.body; // Get updated course data from the request body
    const result = await OfferedCourseService.updateOfferedCourseByIdInDB(
      courseId as string,
      updatedData,
    );
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Offered course updated successfully",
        data: result,
      });
    } else {
      next(new AppError("Offered course not found", 404));
    }
  },
);

// delete user-DELETE
const deleteOfferedCourseById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = checkCommonValidation.validateId(
      req.params.id as string,
      next,
    );
    const result = await OfferedCourseService.deleteOfferedCourseByIdInDB(
      courseId as string,
    );
    if (result) {
      // Check if result is not null or undefined
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Offered course deleted successfully",
        data: result,
      });
    } else {
      next(new AppError("Offered course not found", 404));
    }
  },
);

export const OfferedCourseController = {
  createOfferedCourse,
   getMyOfferedCourses,
  getOfferedCourseById,
  updateOfferedCourseInfo,
  deleteOfferedCourseById,
};
