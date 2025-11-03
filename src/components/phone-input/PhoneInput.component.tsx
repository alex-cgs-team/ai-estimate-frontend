import { PhoneInput } from "react-international-phone";
import { Phone } from "lucide-react";

type Props = {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  description?: string;
  isError?: boolean;
  errorMessage?: string;
};

export function PhoneField({
  value,
  onChange,
  placeholder,
  label,
  description,
  disabled,
  isError,
  errorMessage,
}: Props) {
  return (
    <div className="w-full flex flex-col gap-2">
      {label && <p className="text-body font-bold">{label}</p>}
      <div
        className={`
          group relative flex items-center gap-2
          h-[42px] px-3 py-[10px]
          rounded-xl border
          shadow-[0_1px_2px_rgba(0,0,0,0.05)]
          transition-all duration-200
          outline-none
          ${
            isError
              ? "border-[#DC2626] focus-within:shadow-[0_0_0_3px_rgba(220,38,38,0.2)] focus-within:backdrop-blur-[3px]"
              : "border-gray-300 focus-within:shadow-[0_0_0_3px_rgba(163,163,163,0.5)] focus-within:backdrop-blur-[3px]"
          }
        `}
      >
        <Phone size={16} color="#737373" />
        <div className="flex items-center w-full h-full">
          <PhoneInput
            value={value}
            onChange={(val) => onChange(val ?? "")}
            placeholder={placeholder ?? "+1 (555) 123 4567"}
            className="w-full flex items-center h-full"
            inputClassName="w-full outline-none text-body h-full"
            disabled={disabled}
            inputStyle={{
              all: "unset",
              width: "100%",
              lineHeight: "1.25rem",
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
            style={{
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          />
        </div>
      </div>

      {description && <p className="text-body text-gray-500">{description}</p>}
      {isError && errorMessage && <p>{errorMessage}</p>}
    </div>
  );
}
