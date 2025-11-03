import type { UseModalReturn } from "@/types/types";
import { useState } from "react";

export const useModal = (): UseModalReturn => {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = () => setIsVisible(!isVisible);

  const close = () => setIsVisible(false);
  return {
    isVisible,
    toggle,
    close,
  };
};
