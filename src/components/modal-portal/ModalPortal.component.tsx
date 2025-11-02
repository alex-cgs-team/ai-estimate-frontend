import { createPortal } from "react-dom";
import { type ReactNode, useEffect } from "react";

interface Props {
  children: ReactNode;
  onClose: () => void;
}

export function ModalPortal({ children, onClose }: Props) {
  const modalRoot = document.getElementById("modal-root");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!modalRoot) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-[420px] rounded-2xl bg-white p-6 shadow-xl border border-[#F1F3F8]">
        {children}
      </div>
    </div>,
    modalRoot
  );
}
