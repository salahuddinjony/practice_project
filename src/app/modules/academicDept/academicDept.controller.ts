import { NextFunction, Request, Response } from 'express'
import AppError from '../../errors/AppError.js'
import sendResponse from '../../utils/response/responseSend.js'
import catchAsync from '../../utils/CatchAsync.js'
import { checkCommonValidation } from '../../utils/checkCommonValidation.js'
import { AcademicDeptService } from './academicDept.service.js'

const createAcademicDept = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AcademicDeptService.createAcademicDeptIntoDB(req.body)

    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Academic department created successfully',
            data: result
        })
    } else {
        next(new AppError('Failed to create academic department', 404))
    }
})

// get all academic departments-GET
const getAllAcademicDepts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AcademicDeptService.getAllAcademicDeptsFromDB()
    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Academic departments retrieved successfully',
            data: result
        })
    } else {
        next(new AppError('Failed to retrieve academic departments', 404))
    }
})

// get academic department by ID-GET
const getAcademicDeptById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const deptId = checkCommonValidation.validateId(req.params.id as string, next)

    const result = await AcademicDeptService.getAcademicDeptByIdFromDB(deptId as string)
    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Academic department retrieved successfully',
            data: result
        })
    } else {
        next(new AppError('Academic department not found', 404))
    }
})

// update academic department info-PUT
const updateAcademicDeptInfo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const deptId = checkCommonValidation.validateId(req.params.id as string, next)
    const updatedData = req.body // Get updated academic department data from the request body
    // const validatedData = zodValidateAcademicDeptUpdate(updatedData)
    const result = await AcademicDeptService.updateAcademicDeptInfoInDB(deptId as string, updatedData)
    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Academic department updated successfully',
            data: result
        })
    } else {
        next(new AppError('Academic department not found', 404))
    }

})

// delete academic department-DELETE
const deleteAcademicDept = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const deptId = checkCommonValidation.validateId(req.params.id as string, next)
    const result = await AcademicDeptService.deleteAcademicDeptFromDB(deptId as string)
    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Academic department deleted successfully',
            data: result
        })
    } else {
        next(new AppError('Academic department not found', 404))
    }

})

export const AcademicDeptController = {
    createAcademicDept,
    getAllAcademicDepts,
    getAcademicDeptById,
    updateAcademicDeptInfo,
    deleteAcademicDept
}