import { NextFunction, Request, Response } from 'express'
import { UserService } from './user.service.js'
import { zodValidateUserCreate, zodValidateUserUpdate } from './user.validator.js'
import { Student } from '../student/student.interface.js'
import { zodValidateStudent } from '../student/student.validation.js'
import AppError from '../../errors/AppError.js'

const createStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password, student: studentData } = req.body // Get user data from the request body
        if (!studentData || typeof studentData !== 'object') {
            next(new AppError('Student payload is required', 400))
            return
        }
        // ZOD validation (kept as comment by request): 
        const zodValidationResult = zodValidateStudent(studentData)

        // Call the service function to create the user in the database
        const result = await UserService.createStudentIntoDB(password, zodValidationResult as any)

        if (result) { // Check if result is not null or undefined
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: result
            })
        } else {
            next(new AppError('Failed to create user', 404))
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const statusCode = errorMessage.includes('Validation error') ? 400 : 500
        next(new AppError(error instanceof Error ? error.message : 'Unknown error', 500)) // Pass the error to the global error handler

    }
}

// get all users-GET
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await UserService.getAllUsersFromDB()
        if (result) { // Check if result is not null or undefined
            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: result
            })
        } else {
            next(new AppError('Failed to retrieve users', 404))
        }
    } catch (error) {
        next(new AppError(error instanceof Error ? error.message : 'Unknown error', 500)) // Pass the error to the global error handler

    }
}

// get user by ID-GET
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id // Get user ID from the request parameters
        const result = await UserService.getUserByIdFromDB(userId as string)
        if (result) { // Check if result is not null or undefined
            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: result
            })
        } else {
            next(new AppError('User not found', 404))
        }
    } catch (error) {
        next(new AppError(error instanceof Error ? error.message : 'Unknown error', 500)) // Pass the error to the global error handler
    }
}

// update user info-PUT
const updateUserInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id // Get user ID from the request parameters
        const updatedData = req.body // Get updated user data from the request body
        const validatedData = zodValidateUserUpdate(updatedData)
        const result = await UserService.updateUserInfoInDB(userId as string, validatedData)
        if (result) { // Check if result is not null or undefined
            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: result
            })
        } else {
            next(new AppError('User not found', 404))
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const statusCode = errorMessage.includes('Validation error') ? 400 : 500
        next(new AppError(error instanceof Error ? error.message : 'Unknown error', 500)) // Pass the error to the global error handler

    }
}

// delete user-DELETE
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id // Get user ID from the request parameters
        const result = await UserService.deleteUserFromDB(userId as string)
        if (result) { // Check if result is not null or undefined
            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
                data: result
            })
        } else {
            next(new AppError('User not found', 404))
        }
    } catch (error) {
        next(new AppError(error instanceof Error ? error.message : 'Unknown error', 500)) // Pass the error to the global error handler

    }
}

export const UserController = {
    createStudent,
    getAllUsers,
    getUserById,
    updateUserInfo,
    deleteUser
}