import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/CatchAsync.js";
import sendResponse from "../../utils/response/responseSend.js";
import { AuthService } from "./auth.service.js";
import AppError from "../../errors/handleAppError.js";
import config from "../../config/index.js";

const authLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.authLoginIntoDB(req.body);
    // set in the cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: config.DEVELOPMENT_MODE,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      // sameSite: "strict",
      // path: "/",
      // domain: config.DOMAIN,
      // signed: true,
      // expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
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
    const result = await AuthService.changePasswordIntoDB(req.user, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  },
);

// refresh token
const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.refreshTokenIntoDB(
      req.cookies.refreshToken,
    );
    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } else {
      next(new AppError("Invalid refresh token", 401));
    }
  },
);
export const AuthController = {
  authLogin,
  changePassword,
  refreshToken,
};
