import express from 'express'
import { AcademicSemesterController } from './academicSemester.controller.js'
import validation from '../../middleware/validator/validetResquest.js'
import { academicValidatons } from './academicSemester.validation.js'

const router = express.Router()


// Define your academic semester routes here

// Route for creating an academic semester
router.post(
    '/create-semester',
    validation(academicValidatons.academicSemesterValidationSchema),
    AcademicSemesterController.createSemester
)

// Route for getting all academic semesters
router.get('/get-all-semesters', AcademicSemesterController.getAllSemesters)
// Route for getting all deleted academic semesters
router.get('/get-all-deleted-semesters', AcademicSemesterController.getAllDeletedSemesters)

// Route for getting an academic semester by ID
router.get('/get-semester/:id', AcademicSemesterController.getSemesterById)

// Route for updating academic semester info
router.patch(
    '/update-semester/:id',
    validation(academicValidatons.updateAcademicSemesterValidationSchema),
    AcademicSemesterController.updateSemesterInfo
)

// Route for deleting an academic semester
router.delete('/delete-semester/:id', AcademicSemesterController.deleteSemester)

// restore deleted semesters
router.patch('/restore-deleted-semesters', AcademicSemesterController.restoreDeletedSemesters)
export const AcademicSemesterRoute = router