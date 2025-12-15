import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "../constants/env";

export const FREE_LIMIT = 100;
export const TEXT_FILES_LIMIT = 4;
export const VISUAL_FILES_LIMIT = 3;
export const NOTES_TO_AI_LIMIT = 300;
export const PROJECT_NAME_LIMIT = 50;

export const ACCEPT_FILES = {
  "image/*": [],
  "application/pdf": [],
  "application/msword": [],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
  "text/csv": [],
};

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
