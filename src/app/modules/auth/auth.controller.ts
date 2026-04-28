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
      sameSite: "none",
      path: "/",
      domain: config.DOMAIN,
      signed: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Password changed successfully",
        data: result,
      });
    } else {
      next(new AppError("Invalid credentials", 401));
    }
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

// forget password
const forgetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.forgetPasswordIntoDB(req.body.id);
    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message:
          "Password forgotten successfully, please check your email for the reset password link",
        data: result,
      });
    } else {
      next(new AppError("User not found", 404));
    }
  },
);
// reset password
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const idFromToken = req.user.id as string;
    const result = await AuthService.resetPasswordIntoDB(req.body, idFromToken);
    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Password reset successfully",
        // data: result,
      });
    } else {
      next(new AppError("Invalid credentials", 401));
    }
  },
);

export const AuthController = {
  authLogin,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
