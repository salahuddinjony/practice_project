import express, { NextFunction, Request, Response } from "express";
import validation from "../../middleware/validator/validetResquest.js";
import { FacultyController } from "./faculty.controller.js";
import { facultyValidations } from "./faculty.validation.js";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import { UserRole } from "../user/user.constant.js";
import {
  removeUploadedLocalFile,
  upload,
} from "../../utils/sendImageToCloudinary.js";
import { normalizeUpdateRequestBody } from "../../utils/normalizeUpdateRequestBody.js";

const router = express.Router();

router.post(
  "/create-faculty",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  upload.single("file"),
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = JSON.parse(req.body.data);
      next();
    } catch (error) {
      await removeUploadedLocalFile(req.file?.path);
      next(error);
    }
  },
  validation(facultyValidations.createFacultyPayloadSchema),
  FacultyController.createFaculty,
);

router.get(
  "/get-all-faculties",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  FacultyController.getAllFaculties,
);
router.get("/get-faculty/:id", FacultyController.getFacultyById);

router.patch(
  "/update-faculty/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  upload.single("file"),
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      normalizeUpdateRequestBody(req, {
        payloadKey: "faculty",
        shape: "nested",
      });
      next();
    } catch (error) {
      await removeUploadedLocalFile(req.file?.path);
      next(error);
    }
  },
  validation(facultyValidations.updateFacultyValidationSchema),
  FacultyController.updateFacultyById,
);

router.delete(
  "/delete-faculty/:id",
  authorizationValidate(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  FacultyController.deleteFacultyById,
);

export const FacultyRoute = router;
