import { AuthContext } from "@/providers/auth/auth.context";
import type { AuthContextType } from "@/providers/auth/auth.provider";
import { useContext } from "react";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
