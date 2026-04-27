export const UserRole = {
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  STUDENT: "student",
  FACULTY: "faculty",
} as const;

export const userStatusEnum = ["in-progress", "active", "inactive", "pending", "blocked"] as const;
export const userRoleEnum = Object.values(UserRole);