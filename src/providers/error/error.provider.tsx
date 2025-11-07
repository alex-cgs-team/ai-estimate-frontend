import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ErrorContext } from "./error.context";

export type ErrorContextType = {
  setToastErrorText: (text: string) => void;
  isN8NError: boolean;
  setIsN8NError: React.Dispatch<React.SetStateAction<boolean>>;
};

type ErrorProps = React.PropsWithChildren<object>;

export const ErrorProvider = ({ children }: ErrorProps) => {
  const [toastErrorText, setToastErrorText] = useState("");
  const [isN8NError, setIsN8NError] = useState(false);

  useEffect(() => {
    if (toastErrorText) {
      toast.error(toastErrorText);
      setToastErrorText("");
    }
  }, [toastErrorText]);

  const value: ErrorContextType = useMemo(
    () => ({ setToastErrorText, isN8NError, setIsN8NError }),
    [isN8NError]
  );

  return (
    <>
      <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
    </>
  );
};
