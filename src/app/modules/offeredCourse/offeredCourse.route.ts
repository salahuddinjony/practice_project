import express from "express";

import validation from "../../middleware/validator/validetResquest.js";
import { OfferedCourseController } from "./offeredCourse.controller.js";
import { offeredCourseValidationSchema } from "./offeredCourse.validation.js";
import { UserRole } from "../user/user.constant.js";
import authorizationValidate from "../../middleware/authorizationValidate.js";

const router = express.Router();

// Define your admin routes here

// Route for creating a offered course
// router.post('/create-admin', AdminController.createAdmin)

//create offered course
router.post(
  "/create-offered-course",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validation(offeredCourseValidationSchema.offeredCourseValidation),
  OfferedCourseController.createOfferedCourse,
);

// Get all offered courses
router.get(
  "/get-my-offered-courses",
  authorizationValidate(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY,
    UserRole.STUDENT,
  ),
  OfferedCourseController.getMyOfferedCourses,
);

// Get offered course by ID
router.get(
  "/get-offered-course/:id",
  authorizationValidate(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY,
    UserRole.STUDENT,
  ),
  OfferedCourseController.getOfferedCourseById,
);

// update offered course info
router.patch(
  "/update-offered-course/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validation(offeredCourseValidationSchema.updateOfferedCourseValidation),
  OfferedCourseController.updateOfferedCourseInfo,
);

//delete offered course
router.delete(
  "/delete-offered-course/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  OfferedCourseController.deleteOfferedCourseById,
);

export const OfferedCourseRoute = router;
