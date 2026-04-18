import { NextFunction, Request, Response } from "express";
import AppError from "../../errors/handleAppError.js";
import sendResponse from "../../utils/response/responseSend.js";
import catchAsync from "../../utils/CatchAsync.js";
import { checkCommonValidation } from "../../utils/checkCommonValidation.js";
import { FacultyService } from "./faculty.service.js";

const createFaculty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await FacultyService.createFacultyIntoDB(req.body);

    if (!result) return next(new AppError("Failed to create faculty", 404));

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Faculty created successfully",
      data: result,
    });
  },
);

const getAllFaculties = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await FacultyService.getAllFacultiesFromDB(req.query);

    if (!result) return next(new AppError("Failed to get faculties", 404));

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Faculties retrieved successfully",
      data: result,
    });
  },
);

const getFacultyById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = checkCommonValidation.validateId(req.params.id as string, next);
    const result = await FacultyService.getFacultyByIdFromDB(id as string);

    if (!result) return next(new AppError("Faculty not found", 404));

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Faculty retrieved successfully",
      data: result,
    });
  },
);

const updateFacultyById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = checkCommonValidation.validateId(req.params.id as string, next);
    const result = await FacultyService.updateFacultyByIdInDB(
      id as string,
      req.body,
    );

    if (!result) return next(new AppError("Faculty not found", 404));

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Faculty updated successfully",
      data: result,
    });
  },
);

const deleteFacultyById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = checkCommonValidation.validateId(req.params.id as string, next);
    const result = await FacultyService.deleteFacultyByIdInDB(id as string);

    if (!result) return next(new AppError("Faculty not found", 404));

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Faculty deleted successfully",
      data: result,
    });
  },
);

export const FacultyController = {
  createFaculty,
  getAllFaculties,
  getFacultyById,
  updateFacultyById,
  deleteFacultyById,
};
