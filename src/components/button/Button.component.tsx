import { Loader2 } from "lucide-react";

type Props = {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
};

export const Button = ({
  onClick,
  title,
  disabled,
  isLoading,
  leftIcon,
  rightIcon,
  className,
}: Props) => {
  return (
    <button
      className={`w-full h-10 bg-black rounded-xl py-1 cursor-pointer ${className} ${
        (disabled || isLoading) && "opacity-50"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Loader2
            size={18}
            className="animate-spin text-white"
            strokeWidth={2.5}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {leftIcon && leftIcon}
          <span className="text-body text-white">{title}</span>

          {rightIcon && rightIcon}
        </div>
      )}
    </button>
  );
};
