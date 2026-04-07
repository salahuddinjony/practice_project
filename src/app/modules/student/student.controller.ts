import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'
import { StudentService } from './student.service.js'
import AppError from '../../errors/AppError.js'
// import { validateStudent } from './student.joi.validation.js'
import sendResponse from '../../utils/response/responseSend.js'
import catchAsync from '../../utils/CatchAsync.js'


// Utility function to sanitize and validate student ID
const getSanitizedStudentId = (id: string) => id.trim()

// Utility function to check if a student ID is a valid MongoDB ObjectId
const isValidStudentId = (id: string) => Types.ObjectId.isValid(id)


// Get all students-GET
const getAllStudents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await StudentService.getAllStudentsFromDB()
    if (result) { // Check if result is not null or undefined
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Students retrieved successfully',
            data: result
        })
    } else {
        next(new AppError('Failed to retrieve students', 404))
    }
})

// Get student by ID-GET
const getStudentById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const studentId = getSanitizedStudentId(req.params.id as string)
    if (!isValidStudentId(studentId)) {
        next(new AppError('Invalid student id', 400))
        return
    }

    const result = await StudentService.getStudentByIdFromDB(studentId as string)
    if (result) {
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Student retrieved successfully',
            data: result
        })
    } else {
        next(new AppError('Student not found', 404));
    }

})

// update student-PATCH

const updateStudentInfo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const studentId = getSanitizedStudentId(req.params.id as string)
    if (!isValidStudentId(studentId)) {
        next(new AppError('Invalid student id', 400))
        return
    }

    const updatedData = req.body?.student ?? req.body
    const result = await StudentService.updateStudentInfoInDB(studentId as string, updatedData)
    if (result) {
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Student updated successfully',
            data: result
        })
    } else {
        next(new AppError('Student not found', 404)) // Pass an error to the global error handler
    }
})

// delete student-DELETE
const deleteStudent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const studentId = getSanitizedStudentId(req.params.id as string)
    if (!isValidStudentId(studentId)) {
        next(new AppError('Invalid student id', 400))
        return
    }

    const result = await StudentService.deleteStudentFromDB(studentId as string)
    if (result) {
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Student deleted successfully',
            data: result
        })
    } else {
        next(new AppError('Student not found', 404)) // Pass an error to the global error handler
    }

})
export const StudentController = {
    // createStudent,
    getAllStudents,
    getStudentById,
    updateStudentInfo,
    deleteStudent

}