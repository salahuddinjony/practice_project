import express from "express";

import validation from "../../middleware/validator/validetResquest.js";
import { courseValidation } from "./cources.validation.js";
import { CourseController } from "./cources.controller.js";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import { UserRole } from "../user/user.constant.js";

const router = express.Router();

// Define your admin routes here

// Route for creating a course
// router.post('/create-admin', AdminController.createAdmin)

//create course
router.post(
  "/create-course",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validation(courseValidation.createCourseValidationSchema),
  CourseController.createCource,
);

// Get all courses
router.get(
  "/get-all-cources",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CourseController.getAllCources,
);

// Get course by ID
router.get(
  "/get-course/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CourseController.getCourseById,
);

// update course info
router.patch(
  "/update-course/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validation(courseValidation.updateCourseValidationSchema),
  CourseController.updateCourseInfo,
);

//delete course
router.delete(
  "/delete-course/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CourseController.deleteCourseById,
);

//assign cources in multiple faculties
router.put(
  "/:courseId/assign-to-faculties",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validation(courseValidation.assignCourcesToFacultiesValidationSchema),
  CourseController.assignCourcesToFaculties,
);
// get all assigned courses to a faculty
router.get(
  "/get-all-courses-assigned-to-faculty",
  CourseController.getAllCoursesAssignedToFaculty,
);

// get all assigned faculty By course id
router.get(
  "/:courseId/get-assigned-faculties-by-course-id",
  CourseController.getAssignedFacultyByCourseId,
); 
// Unassign courses from faculties
router.put(
  "/:courseId/unassign-from-faculties",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validation(courseValidation.unassignCourcesFromFacultiesValidationSchema),
  CourseController.unassignCourcesFromFaculties,
);

// Get single assigned course to a faculty
router.get(
  "/:facultyId/assigned-course-to-faculty",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CourseController.getSingleAssignedCourseToFaculty,
);

export const CourseRoute = router;
