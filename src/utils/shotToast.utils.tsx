import { Toast } from "@/components";
import { toast } from "react-toastify";

type Props = {
  text: string;
  type: "success" | "error";
};

export const showToast = ({ text, type }: Props) => {
  toast(<Toast text={text} type={type} />, {
    position: "top-right",
    autoClose: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    hideProgressBar: true,
    className: "!bg-transparent !shadow-none !p-0 !m-0 !border-none",
  });
};
