import * as Select from "@radix-ui/react-select";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

type Option = { label: string; value: string };

type FancySelectProps = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
};

export function DropDown({
  label,
  value,
  onChange,
  options,
  placeholder = "Choose your role",
  disabled,
  error,
}: FancySelectProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger
          className={[
            "group w-full h-[42px] rounded-xl border bg-white px-3 text-left text-sm cursor-pointer flex justify-between",
            value ? "text-gray-900" : "text-gray-400",
            error
              ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-300"
              : "border-gray-200 hover:border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-300",
            disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "",
            "outline-none transition-all duration-150 flex items-center",
          ].join(" ")}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon
            className="
              text-gray-400 transition-transform duration-200
              group-data-[state=open]:rotate-180
            "
          >
            <ChevronDown size={18} />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            sideOffset={8}
            position="popper"
            className="
              z-[999]
              min-w-[var(--radix-select-trigger-width)]
              overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl
            "
          >
            <Select.ScrollUpButton className="flex items-center justify-center py-1 text-gray-500">
              <ChevronUp size={16} />
            </Select.ScrollUpButton>

            <Select.Viewport className="max-h-60 min-w-[220px] p-1">
              {options.map((o) => (
                <Select.Item
                  key={o.value}
                  value={o.value}
                  className={[
                    "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-gray-900",
                    "outline-none data-[highlighted]:bg-gray-100 data-[state=checked]:font-medium",
                  ].join(" ")}
                >
                  <Select.ItemIndicator className="absolute right-3 text-gray-700">
                    <Check size={16} />
                  </Select.ItemIndicator>
                  <Select.ItemText>{o.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>

            <Select.ScrollDownButton className="flex items-center justify-center py-1 text-gray-500">
              <ChevronDown size={16} />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
