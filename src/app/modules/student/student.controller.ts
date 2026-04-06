import { NextFunction, Request, Response } from 'express'
import { Types } from 'mongoose'
import { StudentService } from './student.service.js'
import AppError from '../../errors/AppError.js'
// import { validateStudent } from './student.joi.validation.js'
import { zodValidateStudent } from './student.validation.js'

// Utility function to sanitize and validate student ID
const getSanitizedStudentId = (id: string) => id.trim()

// Utility function to check if a student ID is a valid MongoDB ObjectId
const isValidStudentId = (id: string) => Types.ObjectId.isValid(id)

// // Controller function to create a student-POST
// const createStudent = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // Extract student data from the request body
//         const studentData = req.body?.student ?? req.body
//         if (!studentData || typeof studentData !== 'object') {
//             res.status(400).json({
//                 success: false,
//                 message: 'Student payload is required'
//             })
//             return
//         }

//         // Joi validation throws on invalid payload and returns sanitized value on success.

//         // const validatedStudentData = validateStudent(studentData)
//         // console.log('Received student data:', studentData) // Log the received data for debugging

//           // Joi validation (kept as comment by request):
//         // const joiValidationResult = validateStudent(studentData)

//         // Data validation using ZOD
//         const zodValidationResult = zodValidateStudent(studentData)



//         // Call the service function to create a student in the database
//         const result = await StudentService.createStudentIntoDB(zodValidationResult) // Pass the validated student data to the service function
//         if (result) { // Check if result is not null or undefined
//             res.status(201).json({
//                 success: true,
//                 message: 'Student created successfully',
//                 data: result
//             })
//         } else {
//             res.status(404).json({
//                 success: false,
//                 message: 'Failed to create student'
//             })
//         }

//     } catch (error) {
//         console.error('Error creating student:', error)
//         const errorMessage = error instanceof Error ? error.message : 'Unknown error'
//         const statusCode = errorMessage.includes('Validation error') ? 400 : 500

//         res.status(statusCode).json({
//             success: false,
//             message: 'Failed to create student',
//             error: errorMessage
//         })
//     }

// }

// Get all students-GET
const getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await StudentService.getAllStudentsFromDB()
        if (result) { // Check if result is not null or undefined
            res.status(200).json({
                success: true,
                message: 'Students retrieved successfully',
                data: result
            })
        } else {
            next(new AppError('Failed to retrieve students', 404))
        }
    } catch (error) {
        console.error('Error retrieving students:', error)
        next(new AppError(error instanceof Error ? error.message : 'Unknown error', 500)) // Pass the error to the global error handler
    }
}

// Get student by ID-GET
const getStudentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studentId = getSanitizedStudentId(req.params.id as string)
        if (!isValidStudentId(studentId)) {
            next(new AppError('Invalid student id', 400))
            return
        }
 
        const result = await StudentService.getStudentByIdFromDB(studentId as string)
        if (result) { 
            res.status(200).json({
                success: true,
                message: 'Student retrieved successfully',
                data: result
            })
        } else {
            next(new AppError('Student not found', 404));
        }
    } catch (error) {
        console.error('Error retrieving student:', error)
        next(new AppError(error instanceof Error ? error.message : 'Unknown error', 500)) // Pass the error to the global error handler
    }
}

// update student-PATCH

const updateStudentInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studentId = getSanitizedStudentId(req.params.id as string)
        if (!isValidStudentId(studentId)) {
            next(new AppError('Invalid student id', 400))
            return
        }

        const updatedData = req.body?.student ?? req.body
        const result = await StudentService.updateStudentInfoInDB(studentId as string, updatedData)
        if (result) {
            res.status(200).json({
                success: true,
                message: 'Student updated successfully',
                data: result
            })
        } else {
            next(new AppError('Student not found', 404)) // Pass an error to the global error handler
        }
    } catch (error) {
        console.error('Error updating student:', error)
        next(new AppError(error instanceof Error ? error.message : 'Unknown error', 500)) // Pass the error to the global error handler
    }
}

// delete student-DELETE
const deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studentId = getSanitizedStudentId(req.params.id as string)
        if (!isValidStudentId(studentId)) {
            next(new AppError('Invalid student id', 400))
            return
        }

        const result = await StudentService.deleteStudentFromDB(studentId as string)
        if (result) {
            res.status(200).json({
                success: true,
                message: 'Student deleted successfully',
                // data: result
            })
        } else {
            next(new AppError('Student not found', 404)) // Pass an error to the global error handler
        }
    } catch (error) {
        console.error('Error deleting student:', error)
        next(new AppError(error instanceof Error ? error.message : 'Unknown error', 500)) // Pass the error to the global error handler
    }

}
export const StudentController = {
    // createStudent,
    getAllStudents,
    getStudentById,
    updateStudentInfo,
    deleteStudent

}