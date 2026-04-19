import express from "express";
import validation from "../../middleware/validator/validetResquest.js";
import { FacultyController } from "./faculty.controller.js";
import { facultyValidations } from "./faculty.validation.js";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import { UserRole } from "../user/user.constant.js";

const router = express.Router();

router.post(
  "/create-faculty",
  authorizationValidate(UserRole.ADMIN),
  validation(facultyValidations.createFacultyPayloadSchema),
  FacultyController.createFaculty,
);

router.get(
  "/get-all-faculties",
  authorizationValidate(UserRole.ADMIN),
  FacultyController.getAllFaculties,
);
router.get("/get-faculty/:id", FacultyController.getFacultyById);

router.patch(
  "/update-faculty/:id",
  authorizationValidate(UserRole.ADMIN),
  validation(facultyValidations.updateFacultyValidationSchema),
  FacultyController.updateFacultyById,
);

router.delete(
  "/delete-faculty/:id",
  authorizationValidate(UserRole.ADMIN),
  FacultyController.deleteFacultyById,
);

export const FacultyRoute = router;
