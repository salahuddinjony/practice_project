import express, { NextFunction, Request, Response } from 'express'
import { UserController } from './user.controller.js'
import { userValidations } from './user.validator.js'
import validation from '../../middleware/validator/validetResquest.js'

// Create a router instance
const router = express.Router()



// Define your user routes here

// Route for creating a user
router.post(
    '/create-student',
    validation(userValidations.createStudentPayloadSchema), // Validate the request body against the createStudentPayloadSchema
    UserController.createStudent
)

// Route for getting all users
router.get('/get-all-users', UserController.getAllUsers)

// Route for getting a user by ID
router.get('/get-user/:id', UserController.getUserById)

// Route for updating user info
router.patch(
    '/update-user/:id',
    validation(userValidations.updateUserValidationSchema),
    UserController.updateUserInfo
)
 
// Route for deleting a user
router.delete('/delete-user/:id', UserController.deleteUser)

// Route for getting all deleted users
router.get('/get-all-deleted-users', UserController.getAllDeletedUsers)

// Route for restoring deleted users
router.patch('/restore-deleted-users', UserController.restoreDeletedUsers)
 
export const UserRoute = router