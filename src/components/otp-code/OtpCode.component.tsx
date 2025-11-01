import { TEXT } from "@/shared/constants/text";
import OtpInput from "react-otp-input";

type Props = {
  otp: string;
  setOtp: (code: string) => void;
  disabled?: boolean;
  isWrongCode: boolean;
};

export const OTPCode = ({ otp, setOtp, disabled, isWrongCode }: Props) => {
  return (
    <div className="flex items-center justify-center flex-col gap-1">
      <div
        className={`border ${
          isWrongCode ? "border-red-600" : "border-gray-300"
        } rounded-xl px-4 py-3`}
      >
        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          inputType="tel"
          shouldAutoFocus
          renderInput={(props, idx) => {
            const value = otp[idx] ?? "";
            return (
              <div className="relative w-4 flex items-center justify-center mx-3">
                <input
                  disabled={disabled}
                  {...props}
                  value={value}
                  className="
                    w-4 text-lg font-semibold text-center 
                    bg-transparent outline-none text-gray-900
                  "
                />
                {value === "" && (
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
        <div className="w-full">
          <p className="text-subtitle text-left">{TEXT.wrong_code}</p>
        </div>
      )}
    </div>
  );
};
