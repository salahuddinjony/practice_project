import authorizationValidate from "../../middleware/authorizationValidate.js";
import validation from "../../middleware/validator/validetResquest.js";
import { UserRole } from "../user/user.constant.js";
import { AuthController } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";
import express from "express";

const router = express.Router();

router.post(
  "/login",
  validation(AuthValidation.authLoginValidation),
  AuthController.authLogin,
);

// change password
router.post(
  "/change-password",
  authorizationValidate(
    UserRole.STUDENT,
    UserRole.FACULTY,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  validation(AuthValidation.changePasswordValidation),
  AuthController.changePassword,
);
export const AuthRoute = router;
