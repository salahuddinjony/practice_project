import express, { NextFunction, Request, Response } from 'express'
import validation from '../../middleware/validator/validetResquest.js'
import { AcademicDeptController } from './academicDept.controller.js'
import { academicDeptValidation } from './academicDept.validation.js'

// Create a router instance
const router = express.Router()

// Route for creating an academic department
router.post(
    '/create-academic-dept',
    validation(academicDeptValidation.CreateAcademicDept),
    AcademicDeptController.createAcademicDept
)

// Route for getting all academic departments
router.get('/get-all-academic-depts', AcademicDeptController.getAllAcademicDepts)

// Route for getting an academic department by ID
router.get('/get-academic-dept/:id', AcademicDeptController.getAcademicDeptById)

// Route for updating academic department info
router.patch(
    '/update-academic-dept/:id',
    validation(academicDeptValidation.UpdateAcademicDept),
    AcademicDeptController.updateAcademicDeptInfo
)

// Route for deleting an academic department
router.delete('/delete-academic-dept/:id', AcademicDeptController.deleteAcademicDept)

export const AcademicDeptRoute = router