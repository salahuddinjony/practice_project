import { Model } from "mongoose";
import { UserRole } from "./user.constant.js";

export interface UserInterface {
  id: string;
  password: string;
  passwordChangedAt?: Date;
  needsPasswordReset?: boolean;
  role: "admin" | "student" | "faculty";
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
}
