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

const changePasswordValidation = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(1),
})
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one valid field to change password",
  });

export const AuthValidation = {
  authLoginValidation,
  changePasswordValidation,
};
