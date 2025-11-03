import { createContext } from "react";
import type { ErrorContextType } from "./error.provider";

export const ErrorContext = createContext<ErrorContextType | undefined>(
  undefined
);
