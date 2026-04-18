import express from "express";
import validation from "../../middleware/validator/validetResquest.js";
import { FacultyController } from "./faculty.controller.js";
import { facultyValidations } from "./faculty.validation.js";

const router = express.Router();

router.post(
  "/create-faculty",
  validation(facultyValidations.createFacultyValidationSchema),
  FacultyController.createFaculty,
);

router.get("/get-all-faculties", FacultyController.getAllFaculties);
router.get("/get-faculty/:id", FacultyController.getFacultyById);

router.patch(
  "/update-faculty/:id",
  validation(facultyValidations.updateFacultyValidationSchema),
  FacultyController.updateFacultyById,
);

router.delete("/delete-faculty/:id", FacultyController.deleteFacultyById);

export const FacultyRoute = router;
