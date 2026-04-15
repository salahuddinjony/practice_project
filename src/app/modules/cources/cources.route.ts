import express from "express";

import validation from "../../middleware/validator/validetResquest.js";
import { courseValidation } from "./cources.validation.js";
import { CourseController } from "./cources.controller.js";

const router = express.Router();

// Define your admin routes here

// Route for creating a course
// router.post('/create-admin', AdminController.createAdmin)

//create course
router.post(
  "/create-course",
  validation(courseValidation.createCourseValidationSchema),
  CourseController.createCource,
);

// Get all courses
router.get("/get-all-cources", CourseController.getAllCources);

// Get course by ID
router.get("/get-course/:id", CourseController.getCourseById);

// update course info
router.patch(
  "/update-course/:id",
  validation(courseValidation.updateCourseValidationSchema),
  CourseController.updateCourseInfo,
);

//delete course
router.delete("/delete-course/:id", CourseController.deleteCourseById);

//assign cources in multiple faculties
router.put(
  "/:courseId/assign-to-faculties",
  validation(courseValidation.assignCourcesToFacultiesValidationSchema),
  CourseController.assignCourcesToFaculties,
);
// get all assigned courses to a faculty
router.get(
  "/get-all-courses-assigned-to-faculty",
  CourseController.getAllCoursesAssignedToFaculty,
);

// Unassign courses from faculties
router.put(
  "/:courseId/unassign-from-faculties",
  validation(courseValidation.unassignCourcesFromFacultiesValidationSchema),
  CourseController.unassignCourcesFromFaculties,
);

// Get single assigned course to a faculty
router.get(
  "/:facultyId/assigned-course-to-faculty",
  CourseController.getSingleAssignedCourseToFaculty,
);

export const CourseRoute = router;
