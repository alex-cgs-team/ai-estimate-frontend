import type { UseModalReturn } from "@/types/types";
import { ModalPortal } from "../modal-portal/ModalPortal.component";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps extends UseModalReturn {
  children: ReactNode;
  title: string;
}

export const Modal = ({ close, isVisible, children, title }: ModalProps) => {
  if (!isVisible) return null;

  return (
    <ModalPortal onClose={close}>
      <div>
        <div className="flex justify-between items-center relative">
          <p className="text-title">{title}</p>
          <button
            onClick={close}
            className="cursor-pointer absolute right-0 top-[-6px]"
          >
            <X size={18} color="#6b7280" />
          </button>
        </div>
        {children}
      </div>
    </ModalPortal>
  );
};
