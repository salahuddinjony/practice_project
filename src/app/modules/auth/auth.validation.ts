import { z } from "zod";

const authLoginValidation = z
  .object({
    id: z.string().min(1),
    password: z.string().min(1),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one valid field to login",
  });

const changePasswordValidation = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(1),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one valid field to change password",
  });

/// Shape of `req.cookies` — use `validation(..., "cookies")` on the refresh route.
const refreshTokenValidation = z.object({
  refreshToken: z
    .string({
      message:
        "Refresh token is missing. Include credentials (cookies) or sign in again.",
    })
    .min(1, {
      message: "Refresh token is required",
    }),
});
// 
const forgetPasswordValidation = z.object({
  id: z.string().min(1, {
    message: "User ID is required",
  }),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: "Provide at least one valid field to forget password",
});
export const AuthValidation = {
  authLoginValidation,
  changePasswordValidation,
  refreshTokenValidation,
  forgetPasswordValidation,
};
