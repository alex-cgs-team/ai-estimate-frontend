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
          w-full h-[42px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm
          text-gray-900 placeholder:text-gray-400 outline-none
          focus:border-gray-400 focus:ring-1 focus:ring-gray-300
          disabled:bg-gray-50 disabled:text-gray-400
          transition-all duration-150
        `}
      />
      {error && <p className="text-subtitle font-medium">{error}</p>}
    </div>
  );
};
