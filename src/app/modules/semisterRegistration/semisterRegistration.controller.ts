import { NextFunction, Request, Response } from "express";
import AppError from "../../errors/handleAppError.js";
import sendResponse from "../../utils/response/responseSend.js";
import catchAsync from "../../utils/CatchAsync.js";
import { checkCommonValidation } from "../../utils/checkCommonValidation.js";
import { SemesterRegistrationService } from "./semisterRegistration.servce.js";

const createSemesterRegistration = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const courseData = req.body; // Get course data from the request body

        const result = await SemesterRegistrationService.createSemesterRegistrationIntoDB(courseData);

        if (result) {
            // Check if result is not null or undefined
            sendResponse(res, {
                statusCode: 201,
                success: true,
                message: "Semester registration created successfully",
                data: result,
            });
        } else {
            next(new AppError("Failed to create semester registration", 404));
        }
    },
);

// get all users-GET
const getAllSemesterRegistrations = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query;
        const result = await SemesterRegistrationService.getAllSemesterRegistrationFromDB(query);
        if (result) {
            // Check if result is not null or undefined
            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Semester registrations retrieved successfully",
                data: result,
            });
        } else {
            next(new AppError("Failed to retrieve semester registrations", 404));
        }
    },
);

// get user by ID-GET
const getSemesterRegistrationById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const semisterRegistrationId = checkCommonValidation.validateId(
            req.params.id as string,
            next,
        );

        const result = await SemesterRegistrationService.getSemesterRegistrationByIdFromDB(
            semisterRegistrationId as string,
        );
        if (result) {
            // Check if result is not null or undefined
            sendResponse(res, {
                statusCode: 200,
                success: true,
                        message: "Semester registration retrieved successfully",
                data: result,
            });
        } else {
            next(new AppError("Semester registration not found", 404));
        }
    },
);

// update user info-PUT
const updateSemesterRegistrationInfo = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const semisterRegistrationId = checkCommonValidation.validateId(
            req.params.id as string,
            next,
        );
        const updatedData = req.body; // Get updated semister registration data from the request body
        const result = await SemesterRegistrationService.updateSemesterRegistrationInfoInDB(
            semisterRegistrationId as string,
            updatedData,
        );
        if (result) {
            // Check if result is not null or undefined
            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Semester registration updated successfully",
                data: result,
            });
        } else {
            next(new AppError("Semester registration not found", 404));
        }
    },
);

// delete user-DELETE
const deleteSemesterRegistrationById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const semisterRegistrationId = checkCommonValidation.validateId(
            req.params.id as string,
            next,
        );
        const result = await SemesterRegistrationService.deleteSemesterRegistrationFromDB(semisterRegistrationId as string);
        if (result) {
            // Check if result is not null or undefined
            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Semester registration deleted successfully",
                data: result,
            });
        } else {
            next(new AppError("Semester registration not found", 404));
        }
    },
);

export const SemesterRegistrationController = {
    createSemesterRegistration,
    getAllSemesterRegistrations,
    getSemesterRegistrationById,
    updateSemesterRegistrationInfo,
    deleteSemesterRegistrationById,
};
