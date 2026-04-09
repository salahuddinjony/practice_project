import { NextFunction, Request, Response } from 'express'
import AppError from '../../errors/AppError.js'
import sendResponse from '../../utils/response/responseSend.js'
import catchAsync from '../../utils/CatchAsync.js'
import { checkCommonValidation } from '../../utils/checkCommonValidation.js'
import { AcademicFacultyService } from './academicFaculty.service.js'

const createAcademicFaculty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AcademicFacultyService.createAcademicFacultyIntoDB(req.body)

    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Academic faculty created successfully',
            data: result
        })
    } else {
        next(new AppError('Failed to create academic faculty', 404))
    }
})

// get all academic faculties-GET
const getAllAcademicFaculties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AcademicFacultyService.getAllAcademicFacultiesFromDB()
    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Academic faculties retrieved successfully',
            data: result
        })
    } else {
        next(new AppError('Failed to retrieve academic faculties', 404))
    }
})

// get academic faculty by ID-GET
const getAcademicFacultyById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const facultyId = checkCommonValidation.validateId(req.params.id as string, next)

    const result = await AcademicFacultyService.getAcademicFacultyByIdFromDB(facultyId as string)
    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Academic faculty retrieved successfully',
            data: result
        })
    } else {
        next(new AppError('Academic faculty not found', 404))
    }
})

// update academic faculty info-PUT
const updateAcademicFacultyInfo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const facultyId = checkCommonValidation.validateId(req.params.id as string, next)
    const updatedData = req.body // Get updated academic faculty data from the request body
    // const validatedData = zodValidateAcademicFacultyUpdate(updatedData)
    const result = await AcademicFacultyService.updateAcademicFacultyInfoInDB(facultyId as string, updatedData)
    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Academic faculty updated successfully',
            data: result
        })
    } else {
        next(new AppError('Academic faculty  not found', 404))
    }

})

// delete academic faculty-DELETE
const deleteAcademicFaculty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const facultyId = checkCommonValidation.validateId(req.params.id as string, next)
    const result = await AcademicFacultyService.deleteAcademicFacultyFromDB(facultyId as string)
    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Academic faculty deleted successfully',
            data: result
        })
    } else {
        next(new AppError('Academic faculty not found', 404))
    }

})
// Restore all deleted academic faculties-POST
const restoreDeletedAcademicFaculties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AcademicFacultyService.restoreDeletedAcademicFacultiesInDB()
    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Deleted academic faculties restored successfully',
            data: result
        })
    } 
    else if (result === null) {
        next(new AppError('There are no deleted academic faculties to restore', 404))
    }
    else {
        next(new AppError('Failed to restore deleted academic faculties', 404))
    }
})

// get all deleted academic faculties-GET
const getAllDeletedAcademicFaculties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AcademicFacultyService.getAllDeletedAcademicFacultiesFromDB()
    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Deleted academic faculties retrieved successfully',
            data: result
        })
    }
    else if (result === null) {
        next(new AppError('No deleted academic faculties found', 404))
    }
    else {
        next(new AppError('Failed to retrieve deleted academic faculties', 404))
    }
})
export const AcademicFacultyController = {
    createAcademicFaculty,
    getAllAcademicFaculties,
    getAcademicFacultyById,
    updateAcademicFacultyInfo,
    deleteAcademicFaculty,
    restoreDeletedAcademicFaculties,
    getAllDeletedAcademicFaculties
}