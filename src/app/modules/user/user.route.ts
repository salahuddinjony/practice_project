import express, { NextFunction, Request, Response } from 'express'
import { UserController } from './user.controller.js'
import { userValidations } from './user.validator.js'
import valivation from '../../middleware/validator/validetResquest.js'

// Create a router instance
const router = express.Router()



// Define your user routes here

// Route for creating a user
router.post(
    '/create-student',
    valivation(userValidations.createStudentPayloadSchema), // Validate the request body against the createStudentPayloadSchema
    UserController.createStudent
)

// Route for getting all users
router.get('/get-all-users', UserController.getAllUsers)

// Route for getting a user by ID
router.get('/get-user/:id', UserController.getUserById)

// Route for updating user info
router.patch('/update-user/:id', UserController.updateUserInfo)

// Route for deleting a user
router.delete('/delete-user/:id', UserController.deleteUser)

export const UserRoute = router