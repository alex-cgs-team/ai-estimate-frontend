import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  error?: string | null;
  maxLength?: number;
};

export const Input = ({
  label,
  value,
  onChange,
  placeholder = "",
  disabled = false,
  error,
  type = "text",
  maxLength,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === "password";

  const inputType = isPasswordType
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between">
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        {maxLength && value && (
          <label className="text-subtitle">
            {value.length}/{maxLength}
          </label>
        )}
      </div>

      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          type={inputType}
          className={`
            w-full h-[42px] rounded-xl border px-3 py-2 text-sm outline-none
            bg-white text-gray-900 placeholder:text-gray-400
            shadow-[0_1px_2px_rgba(0,0,0,0.05)]
            transition-all duration-200 
            
            ${isPasswordType ? "pr-10" : ""} /* Отступ справа для иконки */

            ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}

            ${
              error
                ? `
                border-[#DC2626]
                focus:border-[#DC2626]
                focus:shadow-[0_0_0_3px_rgba(220,38,38,0.2)]
                focus:backdrop-blur-[3px]
              `
                : `
                border-gray-300
                focus:border-gray-400
                focus:shadow-[0_0_0_3px_rgba(163,163,163,0.5)]
                focus:backdrop-blur-[3px]
              `
            }
          `}
        />

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
