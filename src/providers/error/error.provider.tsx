import React, { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { ErrorContext } from "./error.context";

export type ErrorContextType = {
  setToastErrorText: (text: string) => void;
};

type ErrorProps = React.PropsWithChildren<object>;

export const ErrorProvider = ({ children }: ErrorProps) => {
  const [toastErrorText, setToastErrorText] = React.useState("");

  useEffect(() => {
    if (toastErrorText) {
      toast.error(toastErrorText);
      setToastErrorText("");
    }
  }, [toastErrorText]);

  const value: ErrorContextType = useMemo(() => ({ setToastErrorText }), []);

  return (
    <>
      <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
    </>
  );
};
