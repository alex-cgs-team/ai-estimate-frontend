import type React from "react";
import { AuthProvider } from "./auth/auth.provider";
import { ErrorProvider } from "./error/error.provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorProvider>
      <AuthProvider>{children}</AuthProvider>
    </ErrorProvider>
  );
};
