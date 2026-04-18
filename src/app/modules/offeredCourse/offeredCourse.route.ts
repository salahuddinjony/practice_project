import express from "express";

import validation from "../../middleware/validator/validetResquest.js";
import { OfferedCourseController } from "./offeredCourse.controller.js";
import { offeredCourseValidationSchema } from "./offeredCourse.validation.js";

const router = express.Router();

// Define your admin routes here

// Route for creating a offered course
// router.post('/create-admin', AdminController.createAdmin)

//create offered course
router.post(
  "/create-offered-course",
  validation(offeredCourseValidationSchema.offeredCourseValidation),
  OfferedCourseController.createOfferedCourse,
);

// Get all offered courses
router.get(
  "/get-all-offered-courses",
  OfferedCourseController.getAllOfferedCourses,
);

// Get offered course by ID
router.get(
  "/get-offered-course/:id",
  OfferedCourseController.getOfferedCourseById,
);

// update offered course info
router.patch(
  "/update-offered-course/:id",
  validation(offeredCourseValidationSchema.updateOfferedCourseValidation),
  OfferedCourseController.updateOfferedCourseInfo,
);

//delete offered course
router.delete(
  "/delete-offered-course/:id",
  OfferedCourseController.deleteOfferedCourseById,
);

export const OfferedCourseRoute = router;
