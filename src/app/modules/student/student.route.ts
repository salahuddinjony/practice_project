import express from 'express'
import { StudentController } from './student.controller.js'
import validation from '../../middleware/validator/validetResquest.js'
import { studentValidation } from './student.validation.js'
const router = express.Router()

// Define your student routes here

// Route for creating a student
// router.post('/create-student', StudentController.createStudent)


// Get all students
router.get('/get-all-students', StudentController.getAllStudents)
// Get all deleted students
router.get('/get-all-deleted-students', StudentController.getAllDeletedStudents)

// Get student by ID
router.get('/get-student/:id', StudentController.getStudentById)

// update student info
router.patch(
    '/update-student/:id',
    validation(studentValidation.updateStudentValidationSchema),
    StudentController.updateStudentInfo
)

//delete student
router.delete('/delete-student/:id', StudentController.deleteStudent)

// restore deleted students
router.patch('/restore-deleted-students', StudentController.restoreDeletedStudents)


// Export the router to be used in the main app
export const StudentRoute = router
