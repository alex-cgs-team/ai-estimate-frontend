import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(2, "Min 2 characters").max(50, "Max 50 characters"),

  role: z.string().min(1, "Select your role"),
});

export type OnboardingFormType = z.infer<typeof onboardingSchema>;

export const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "At least 6 characters"),
});

export const signUpSchema = signInSchema
  .extend({
    confirmPassword: z.string().min(6, "At least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignInFormType = z.infer<typeof signInSchema>;
export type SignUpFormType = z.infer<typeof signUpSchema>;
