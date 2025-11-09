import axios from "axios";
import { VITE_BACKEND_URL } from "../constants/env";

export const api = axios.create({
  baseURL: VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
