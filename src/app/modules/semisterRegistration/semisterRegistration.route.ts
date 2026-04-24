import express, { NextFunction, Request, Response } from "express";
import validation from "../../middleware/validator/validetResquest.js";
import { SemesterRegistrationController } from "./semisterRegistration.controller.js";
import { semisterRegisterationValidationSchema } from "./semisterRegistration.validation.js";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import { UserRole } from "../user/user.constant.js";

// Create a router instance
const router = express.Router();

// Route for creating an semester registration
router.post(
  "/create-semister-registration",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN,UserRole.FACULTY,UserRole.STUDENT),
  validation(
    semisterRegisterationValidationSchema.semisterRegisterationValidation,
  ), // Validate the request body against the createSemesterRegistrationPayloadSchema
  SemesterRegistrationController.createSemesterRegistration,
);

// Route for getting all semester registrations
router.get(
  "/get-all-semister-registrations",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SemesterRegistrationController.getAllSemesterRegistrations,
);

// Route for getting an semester registration by ID
router.get(
  "/get-semister-registration/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SemesterRegistrationController.getSemesterRegistrationById,
);

// Route for updating semester registration info
router.patch(
  "/update-semister-registration/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validation(
    semisterRegisterationValidationSchema.semisterRegisterationUpdateValidation,
  ),
  SemesterRegistrationController.updateSemesterRegistrationInfo,
);

// Route for deleting an semester registration
// router.delete('/delete-semister-registration/:id', SemesterRegistrationController.deleteSemesterRegistrationById)

// Route for getting all deleted semester registrations
// router.get('/get-all-deleted-semester-registrations', SemesterRegistrationController.getAllDeletedSemesterRegistrations)

// // Route for restoring all deleted semester registrations
// router.patch('/restore-deleted-semester-registrations', SemesterRegistrationController.restoreDeletedSemesterRegistrations)
export const SemesterRegistrationRoute = router;
