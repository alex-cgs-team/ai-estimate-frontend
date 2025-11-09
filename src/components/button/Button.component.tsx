import { Loader2 } from "lucide-react";

type Props = {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  type?: "white" | "black" | "outline";
};

export const Button = ({
  onClick,
  title,
  disabled,
  isLoading,
  leftIcon,
  rightIcon,
  className = "",
  type = "outline",
}: Props) => {
  const baseStyles =
    "w-full h-10 rounded-xl py-1 cursor-pointer flex items-center justify-center gap-2 transition";

  const variants: Record<typeof type, string> = {
    black: "bg-black text-white hover:bg-[#111] active:scale-[0.98]",
    white:
      "bg-white text-black border border-[#E5E7EB] hover:bg-gray-50 active:scale-[0.98]",
    outline:
      "border border-[#A36FD1] shadow-[0_0_0_2px_#E5D0F5,0_4px_12px_0_rgba(0,0,0,0.1)] bg-[linear-gradient(180deg,#FFFDFF_0%,#FCEDFF_100%)] active:scale-[0.98]",
  };

  const textStyles = {
    black: "text-white",
    white: "text-black",
    outline: "text-[#5A4886]",
  };

  const colorStyles = {
    black: "text-white",
    white: "text-black",
    outline: "text-[#5A4886]",
  };

  const disabledStyles =
    disabled || isLoading ? "opacity-50 pointer-events-none" : "";

  return (
    <button
      className={`${baseStyles} ${variants[type]} ${disabledStyles} ${className} `}
      onClick={onClick}
      disabled={disabled}
    >
      {isLoading ? (
        <Loader2
          size={18}
          className={`animate-spin ${colorStyles[type]}`}
          strokeWidth={2.5}
        />
      ) : (
        <>
          {leftIcon}
          <span className={`text-body font-medium ${textStyles[type]}`}>
            {title}
          </span>
          {rightIcon}
        </>
      )}
    </button>
  );
};
