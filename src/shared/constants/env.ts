export const isDev = import.meta.env.MODE === "development";
export const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string;
export const API_BASE = isDev
  ? "http://localhost:4000"
  : (import.meta.env.VITE_BACKEND_URL as string);

export const STRIPE_PUBLISHABLE_KEY = import.meta.env
  .VITE_STRIPE_PUBLISHABLE_KEY as string;

export const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID as string;
export const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;
