type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  error?: string | null;
};

export const Input = ({
  label,
  value,
  onChange,
  placeholder = "",
  disabled = false,
  error,
}: Props) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full h-[42px] rounded-xl border px-3 py-2 text-sm outline-none
          bg-white text-gray-900 placeholder:text-gray-400
          shadow-[0_1px_2px_rgba(0,0,0,0.05)]
          transition-all duration-200 

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

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
