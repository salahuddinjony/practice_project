import express from "express";

import validation from "../../middleware/validator/validetResquest.js";
import { UserRole } from "../user/user.constant.js";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import { enrolledCourseValidation } from "./enrolledCourse.validation.js";
import { EnrolledCourseController } from "./enrolledCourse.controller.js";

const router = express.Router();

// Define your admin routes here

// Route for creating a enrolled course
// router.post('/create-admin', AdminController.createAdmin)

//create enrolled course
router.post(
  "/create-enrolled-course",
  authorizationValidate(UserRole.STUDENT),
  validation(enrolledCourseValidation.createEnrolledCourseValidationSchema),
  EnrolledCourseController.createEnrolledCourse,
);

// Get all enrolled courses
router.get(
  "/get-all-enrolled-courses",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  EnrolledCourseController.getAllEnrolledCourses,
);
//get my enrolled courses
router.get(
  "/get-my-enrolled-courses",
  authorizationValidate(UserRole.STUDENT),
  EnrolledCourseController.getMyEnrolledCourses,
); 
// Get enrolled course by ID
router.get(
  "/get-enrolled-course/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  EnrolledCourseController.getEnrolledCourseById,
);

// update enrolled course info
router.patch(
  "/update-enrolled-course/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validation(enrolledCourseValidation.updateEnrolledCourseValidationSchema),
  EnrolledCourseController.updateEnrolledCourseById,
);

//delete enrolled course
router.delete(
  "/delete-enrolled-course/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STUDENT),
  EnrolledCourseController.deleteEnrolledCourseById,
);

export const EnrolledCourseRoute = router;
