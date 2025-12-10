import { z } from "zod";

export const changeEmailSchema = z.object({
  newEmail: z.email("Invalid email address"),

  password: z.string().min(6, "At least 6 characters"),
});

export type ChangeEmailFormType = z.infer<typeof changeEmailSchema>;

export const forgotPasswordEmailSchema = z.object({
  email: z.email("Invalid email address"),
});

export type ForgotPasswordEmailFormType = z.infer<
  typeof forgotPasswordEmailSchema
>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "At least 6 characters"),
    password: z.string().min(6, "At least 6 characters"),
    confirmPassword: z.string().min(6, "At least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormType = z.infer<typeof changePasswordSchema>;
