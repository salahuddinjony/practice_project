import express, { NextFunction, Request, Response } from "express";
import { StudentController } from "./student.controller.js";
import validation from "../../middleware/validator/validetResquest.js";
import { studentValidation } from "./student.validation.js";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import { UserRole } from "../user/user.constant.js";
import {
  removeUploadedLocalFile,
  upload,
} from "../../utils/sendImageToCloudinary.js";
import { normalizeUpdateRequestBody } from "../../utils/normalizeUpdateRequestBody.js";

const router = express.Router();

// Define your student routes here

// Route for creating a student
// router.post('/create-student', StudentController.createStudent)

// Get all students
router.get(
  "/get-all-students",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY),
  StudentController.getAllStudents,
);
// Get all deleted students
router.get(
  "/get-all-deleted-students",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  StudentController.getAllDeletedStudents,
);

// Get student by ID
router.get(
  "/get-student/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY),
  StudentController.getStudentById,
);

// PATCH: multipart `data` + optional `file`, or file only; or application/json `{ "student": { ... } }`.
router.patch(
  "/update-student/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY),
  upload.single("file"),
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      normalizeUpdateRequestBody(req, {
        payloadKey: "student",
        shape: "nested",
      });
      next();
    } catch (error) {
      await removeUploadedLocalFile(req.file?.path);
      next(error);
    }
  },
  validation(studentValidation.updateStudentValidationSchema),
  StudentController.updateStudentInfo,
);

//delete student
router.delete(
  "/delete-student/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY),
  StudentController.deleteStudent,
);

// restore deleted students
router.patch(
  "/restore-deleted-students",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  StudentController.restoreDeletedStudents,
);

// Export the router to be used in the main app
export const StudentRoute = router;
