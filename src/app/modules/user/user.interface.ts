import { Model } from "mongoose";
import { UserRole } from "./user.constant.js";

export type UserRoleEnum = "admin" | "student" | "faculty";
export interface UserInterface {
  id: string;
  password: string;
  email: string;
  passwordChangedAt?: Date;
  needsPasswordReset?: boolean;
  role: UserRoleEnum;
  isDeleted?: boolean;
  status?: "in-progress" | "active" | "inactive" | "pending" | "blocked";
}

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// interface for user methods for defining custom methods
export interface UserMethods extends Model<UserInterface> {
  isUserIdValid(
    id: string,
    password?: string,
    checkPassword?: boolean,
    checkIsBlocked?: boolean,
  ): Promise<Partial<UserInterface>>;
  isPasswordChanged(passwordChangedAt: Date, iat: number): boolean;
}
