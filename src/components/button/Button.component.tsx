import { Loader2 } from "lucide-react";

type Props = {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  type?: "white" | "black";
};

export const Button = ({
  onClick,
  title,
  disabled,
  isLoading,
  leftIcon,
  rightIcon,
  className = "",
  type = "black",
}: Props) => {
  const baseStyles =
    "w-full h-10 rounded-xl py-1 cursor-pointer flex items-center justify-center gap-2 transition";

  const variants: Record<typeof type, string> = {
    black: "bg-black text-white hover:bg-[#111] active:scale-[0.98]",
    white:
      "bg-white text-black border border-[#E5E7EB] hover:bg-gray-50 active:scale-[0.98]",
  };

  const disabledStyles =
    disabled || isLoading ? "opacity-50 pointer-events-none" : "";

  return (
    <button
      className={`${baseStyles} ${variants[type]} ${disabledStyles} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {isLoading ? (
        <Loader2
          size={18}
          className={`animate-spin ${
            type === "white" ? "text-black" : "text-white"
          }`}
          strokeWidth={2.5}
        />
      ) : (
        <>
          {leftIcon}
          <span
            className={`text-body ${
              type === "white" ? "text-black" : "text-white"
            }`}
          >
            {title}
          </span>
          {rightIcon}
        </>
      )}
    </button>
  );
};
