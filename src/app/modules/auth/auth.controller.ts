import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/CatchAsync.js";
import sendResponse from "../../utils/response/responseSend.js";
import { AuthService } from "./auth.service.js";
import AppError from "../../errors/handleAppError.js";

const authLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.authLoginIntoDB(req.body);
    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Login successful",
        data: result,
      });
    } else {
      next(new AppError("Invalid credentials", 401));
    }
  },
);

const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.changePasswordIntoDB(req.user.user, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  },
);
export const AuthController = {
  authLogin,
  changePassword,
};
