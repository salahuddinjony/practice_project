import express from "express";

import validation from "../../middleware/validator/validetResquest.js";
import { AdminController } from "./admin.controller.js";
import { adminValidation } from "./admin.validation.js";
import authorizationValidate from "../../middleware/authorizationValidate.js";
import { UserRole } from "../user/user.constant.js";

const router = express.Router();

// Define your admin routes here

// Route for creating an admin
// router.post('/create-admin', AdminController.createAdmin)

//create admin
router.post(
  "/create-admin",
  authorizationValidate(UserRole.ADMIN),
  validation(adminValidation.createAdminPayloadSchema),
  AdminController.CreateAdmin,
);

// Get all admins
router.get("/get-all-admins", authorizationValidate(UserRole.ADMIN), AdminController.getAllAdmins);

// Get admin by ID
router.get("/get-admin/:id", authorizationValidate(UserRole.ADMIN), AdminController.getAdminById);

// update admin info
router.patch(
  "/update-admin/:id",
  authorizationValidate(UserRole.ADMIN),
  validation(adminValidation.adminUpdatePayloadSchema),
  AdminController.updateAdminInfo,
);

//delete admin
router.delete("/delete-admin/:id", authorizationValidate(UserRole.ADMIN), AdminController.deleteAdmin);

// restore deleted admins
// router.patch('/restore-deleted-admins', AdminController.restoreDeletedAdmins)

// Export the router to be used in the main app
export const AdminRoute = router;
