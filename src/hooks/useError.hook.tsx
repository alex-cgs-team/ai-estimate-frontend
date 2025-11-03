import { ErrorContext } from "@/providers/error/error.context";
import React from "react";

export const useError = () => {
  const context = React.useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within a ErrorProvider");
  }
  return context;
};
