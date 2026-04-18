import express from "express";
import { StudentController } from "./student.controller.js";
import validation from "../../middleware/validator/validetResquest.js";
import { studentValidation } from "./student.validation.js";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import { UserRole } from "../user/user.constant.js";
const router = express.Router();

// Define your student routes here

// Route for creating a student
// router.post('/create-student', StudentController.createStudent)

// Get all students
router.get(
  "/get-all-students",
  authorizationValidate(UserRole.STUDENT),
  StudentController.getAllStudents,
);
// Get all deleted students
router.get(
  "/get-all-deleted-students",
  authorizationValidate(UserRole.ADMIN),
  StudentController.getAllDeletedStudents,
);

// Get student by ID
router.get(
  "/get-student/:id",
  authorizationValidate(UserRole.STUDENT),
  StudentController.getStudentById,
);

// update student info
router.patch(
  "/update-student/:id",
  authorizationValidate(UserRole.STUDENT),
  validation(studentValidation.updateStudentValidationSchema),
  StudentController.updateStudentInfo,
);

//delete student
router.delete(
  "/delete-student/:id",
  authorizationValidate(UserRole.ADMIN),
  StudentController.deleteStudent,
);

// restore deleted students
router.patch(
  "/restore-deleted-students",
  authorizationValidate(UserRole.ADMIN),
  StudentController.restoreDeletedStudents,
);

// Export the router to be used in the main app
export const StudentRoute = router;
