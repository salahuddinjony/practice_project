import AppError from "../../errors/handleAppError.js";
import { UserModel } from "../user/user.model.js";
import jwt, { JwtPayload, type SignOptions } from "jsonwebtoken";
import config from "../../config/index.js";
import { Auth } from "./auth.interface.js";
import { UserInterface } from "../user/user.interface.js";
import bcrypt from "bcrypt";

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
  user: Partial<UserInterface> & { _id?: string },
  payload: { oldPassword: string; newPassword: string },
) => {
  await UserModel.isUserIdValid(user.id as string, payload.oldPassword);

  // check old and new password are not the same
  if (payload.oldPassword === payload.newPassword) {
    throw new AppError("Old and new password are the same", 400);
  }

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

export const AuthService = {
  authLoginIntoDB,
  changePasswordIntoDB,
};
