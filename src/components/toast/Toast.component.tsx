import { CircleAlert, CircleCheck } from "lucide-react";

type Props = {
  text: string;
  type: "success" | "error";
};

export const Toast = ({ text, type }: Props) => {
  const isSuccess = type === "success";

  return (
    <div
      className={`
        w-full h-16 
        relative flex items-center gap-2 rounded-lg px-4 py-3 bg-gray-50
        border-t border-[#E5E5E5]
        shadow-[0_4px_12px_-1px_rgba(0,0,0,0.1)]
      `}
    >
      {isSuccess ? (
        <CircleCheck size={20} color="#16A34A" />
      ) : (
        <CircleAlert size={20} color="#DC2626" />
      )}
      <p className="text-body text-[16px] font-medium text-gray-800">{text}</p>
    </div>
  );
};
