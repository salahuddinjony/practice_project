import AppError from "../../errors/handleAppError.js";
import { UserModel } from "../user/user.model.js";
import jwt, { JwtPayload, type SignOptions } from "jsonwebtoken";
import config from "../../config/index.js";
import { Auth } from "./auth.interface.js";
import { UserInterface } from "../user/user.interface.js";
import bcrypt from "bcrypt";
import type { Types } from "mongoose";

const authLoginIntoDB = async (authData: Auth) => {
  const { id, password } = authData;
  try {
    const user = await UserModel.isUserIdValid(id, password);

    const accessToken = jwt.sign({ user }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    } as SignOptions);

    const refreshToken = jwt.sign({ user }, config.JWT_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);

    return {
      accessToken,
      refreshToken,
      user,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      error instanceof Error ? error.message : "Something went wrong",
      500,
    );
  }
};

const changePasswordIntoDB = async (
  user: Partial<UserInterface> & { _id?: Types.ObjectId | string },
  payload: { oldPassword: string; newPassword: string },
) => {
  await UserModel.isUserIdValid(user.id as string, payload.oldPassword);

  // check old and new password are not the same
  if (payload.oldPassword === payload.newPassword) {
    throw new AppError("Old and new password are the same!", 400);
  }

  // hash new password using bcrypt
  const newPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.BCRYPT_SALT_ROUNDS),
  );
  const updatedUser = await UserModel.findByIdAndUpdate(user._id, {
    password: newPassword,
    needsPasswordReset: false,
    passwordChangedAt: new Date(),
  });
  return updatedUser;
};
// refresh token
const refreshTokenIntoDB = async (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, config.JWT_SECRET) as JwtPayload;
  const { user } = decoded;
  const isValidUser = await UserModel.isUserIdValid(
    user.id as string,
    undefined,
    false,
    false,
  );
  if (!isValidUser) {
    throw new AppError("User not found", 404);
  }
  if (isValidUser.status !== "active") {
    throw new AppError("User is not active, please contact admin", 401);
  }
  if (
    UserModel.isPasswordChanged(
      isValidUser.passwordChangedAt as Date,
      decoded.iat as number,
    )
  ) {
    throw new AppError("Password changed, please login again", 401);
  }
  const accessToken = jwt.sign({ user }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as SignOptions);
  return {
    accessToken,
  };
};
// forget password
const forgetPasswordIntoDB = async (id: string) => {
  const isValidUser = await UserModel.isUserIdValid(
    id,
    undefined,
    false,
    false,
  );
  if (!isValidUser) {
    throw new AppError("User not found", 404);
  }
  if (isValidUser.status !== "active") {
    throw new AppError("User is not active, please contact admin", 401);
  }
  // generate token
  const resetPasswordToken = jwt.sign({ isValidUser }, config.JWT_SECRET, {
    expiresIn: "5m",
  } as SignOptions);

  const url = `${config.FRONTEND_URL}/reset-password?id=${id}&token=${resetPasswordToken}`;
  return {
    url: url,
    expiresIn: "5m",
  };
};
export const AuthService = {
  authLoginIntoDB,
  changePasswordIntoDB,
  refreshTokenIntoDB,
  forgetPasswordIntoDB,
};
