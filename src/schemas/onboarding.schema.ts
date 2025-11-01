import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(2, "Min 2 characters").max(50, "Max 50 characters"),

  role: z.string().min(1, "Select your role"),
});

export type OnboardingFormType = z.infer<typeof onboardingSchema>;
