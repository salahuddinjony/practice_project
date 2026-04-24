import express, { NextFunction, Request, Response } from 'express'
import { academicFacultyValidations } from './academicFaculty.validation.js'
import validation from '../../middleware/validator/validetResquest.js'
import { AcademicFacultyController } from './academicFaculty.controller.js'

// Create a router instance
const router = express.Router()

// Route for creating an academic faculty
router.post(
    '/create-academic-faculty',
    validation(academicFacultyValidations.academicFacultyValidationSchema), // Validate the request body against the createAcademicFacultyPayloadSchema
    AcademicFacultyController.createAcademicFaculty
)

// Route for getting all academic faculties
router.get('/get-all-academic-faculties', AcademicFacultyController.getAllAcademicFaculties)

// Route for getting an academic faculty by ID
router.get('/get-academic-faculty/:id', AcademicFacultyController.getAcademicFacultyById)

// Route for updating academic faculty info
router.patch(
    '/update-academic-faculty/:id',
    validation(academicFacultyValidations.updateAcademicFacultyValidationSchema),
    AcademicFacultyController.updateAcademicFacultyInfo
)

// Route for deleting an academic faculty
router.delete('/delete-academic-faculty/:id', AcademicFacultyController.deleteAcademicFaculty)


// Route for getting all deleted academic faculties
router.get('/get-all-deleted-academic-faculties', AcademicFacultyController.getAllDeletedAcademicFaculties)

// Route for restoring all deleted academic faculties
router.patch('/restore-deleted-academic-faculties', AcademicFacultyController.restoreDeletedAcademicFaculties)  
export const AcademicFacultyRoute = router