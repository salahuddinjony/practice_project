import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/CatchAsync.js";
import AppError from "../errors/handleAppError.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/index.js";
import { UserRoleType } from "../modules/user/user.interface.js";
import { UserModel } from "../modules/user/user.model.js";
import { Admin } from "../modules/admin/admin.interface.js";
// middleware to log incoming requests for debugging

const authorizationValidate = (...roles: UserRoleType[]) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      // its take token from the header and split it by space and take the second element for Bearer Token
      const token = req.headers.authorization?.split(" ")[1] as string;
      if (!token) {
        throw new AppError("Unauthorized", 401);
      }
    //   console.log("Token:", token);
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    console.log("Decoded:", decoded);
    const {id, role, status} = decoded.user;
    const isValidUser = await UserModel.isUserIdValid(id, undefined, false, false);
    if (!isValidUser) {
      throw new AppError("User not found", 404);
    }

    //check status is active
    if (isValidUser.status !== "active") {
      throw new AppError("User is not active, please contact admin", 401);
    }

    if (!roles.includes(role as UserRoleType)) {
      throw new AppError("You are not authorized to access this resource", 403);
    }
    req.user = isValidUser;
    return next();
    },
  );
};

export default authorizationValidate;
