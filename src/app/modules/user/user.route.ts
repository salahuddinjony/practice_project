import express, { NextFunction, Request, Response } from 'express'
import { UserController } from './user.controller.js'
import { userValidations } from './user.validator.js'
import validation from '../../middleware/validator/validetResquest.js'
import { UserRole } from './user.constant.js'
import authorizationValidate from '../../middleware/authorizationValidate.js'

// Create a router instance
const router = express.Router()



// Define your user routes here

// Route for creating a user and Student
router.post(
    '/create-student',
    authorizationValidate(UserRole.ADMIN),
    validation(userValidations.createStudentPayloadSchema), // Validate the request body against the createStudentPayloadSchema
    UserController.createStudent
)

// Route for getting all users
router.get('/get-all-users', authorizationValidate(UserRole.ADMIN), UserController.getAllUsers)

// Route for getting a user by ID
router.get('/get-user/:id', authorizationValidate(UserRole.ADMIN), UserController.getUserById)

// Route for updating user info
router.patch(
    '/update-user/:id',
    authorizationValidate(UserRole.ADMIN),
    validation(userValidations.updateUserValidationSchema),
    UserController.updateUserInfo
)
 
// Route for deleting a user
router.delete('/delete-user/:id', authorizationValidate(UserRole.ADMIN), UserController.deleteUser)

// Route for getting all deleted users
router.get('/get-all-deleted-users', authorizationValidate(UserRole.ADMIN), UserController.getAllDeletedUsers)

// Route for restoring deleted users
router.patch('/restore-deleted-users', authorizationValidate(UserRole.ADMIN), UserController.restoreDeletedUsers)
 
export const UserRoute = router