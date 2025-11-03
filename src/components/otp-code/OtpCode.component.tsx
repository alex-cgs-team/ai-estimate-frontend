import { TEXT } from "@/shared/constants/text";
import OtpInput from "react-otp-input";
import { useRef } from "react";

type Props = {
  otp: string;
  setOtp: (code: string) => void;
  disabled?: boolean;
  isWrongCode: boolean;
};

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (el: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(el);
      else (ref as React.RefObject<T | null>).current = el;
    }
  };
}

export const OTPCode = ({ otp, setOtp, disabled, isWrongCode }: Props) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focusSmart = () => {
    const idx = Math.min(otp.length, 5);
    inputsRef.current[idx]?.focus();
  };

  return (
    <div
      className="flex items-center justify-center flex-col gap-1"
      onPointerDown={(e) => {
        if (!(e.target instanceof HTMLInputElement)) {
          e.preventDefault();
          focusSmart();
        }
      }}
    >
      <div
        className={`
          group relative flex items-center justify-center
          px-3 py-[6px] h-12
          rounded-xl border
          shadow-[0_1px_2px_rgba(0,0,0,0.05)]
          transition-all duration-200
          outline-none cursor-text
          ${
            isWrongCode
              ? "border-[#DC2626] focus-within:shadow-[0_0_0_3px_rgba(220,38,38,0.2)] focus-within:backdrop-blur-[3px]"
              : "border-gray-300 focus-within:shadow-[0_0_0_3px_rgba(163,163,163,0.5)] focus-within:backdrop-blur-[3px]"
          }
        `}
      >
        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          inputType="tel"
          shouldAutoFocus
          renderInput={(inputProps, idx) => {
            const curr = otp[idx] ?? "";
            return (
              <div
                key={`otp-${idx}`}
                className="relative w-4 flex items-center justify-center mx-3"
              >
                <input
                  {...inputProps}
                  ref={mergeRefs(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (inputProps as any).ref,
                    (el: HTMLInputElement | null) => {
                      inputsRef.current[idx] = el;
                    }
                  )}
                  disabled={disabled}
                  value={curr}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-4 text-lg font-semibold text-center bg-transparent outline-none text-gray-900 caret-transparent"
                />
                {curr === "" && (
                  <span className="absolute text-gray-400 text-xl leading-none select-none">
                    •
                  </span>
                )}
              </div>
            );
          }}
          inputStyle={{ border: "none", outline: "none" }}
        />
      </div>

      {isWrongCode && (
        <div className="flex justify-start w-full">
          <p className="text-subtitle">{TEXT.wrong_code}</p>
        </div>
      )}
    </div>
  );
};
