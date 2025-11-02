import { MobilePNG } from "@/assets/images";
import { ArrowBack, OTPCode } from "@/components";
import { useAuth, useError } from "@/hooks";
import { ROUTES } from "@/shared/constants/routes";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { Edit3Icon, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const CodeVerification = () => {
  const [code, setCode] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWrongCode, setIsWrongCode] = useState(false);

  const { verifyCode, signInWithPhone, confirmNewPhone } = useAuth();
  const { setToastErrorText } = useError();

  const location = useLocation();
  const phone: string | undefined = location.state?.phone;
  const isChangePhone: boolean = Boolean(location.state?.changePhone);

  const navigate = useNavigate();

  useEffect(() => {
    if (!phone) navigate("/");
  }, [phone, navigate]);

  const handleVerifyLogin = useCallback(
    async (otp: string) => {
      const isNewUser = await verifyCode(otp);
      if (isNewUser) navigate(ROUTES.onboarding);
      else navigate(ROUTES.main);
    },
    [verifyCode, navigate]
  );

  const handleVerifyChangePhone = useCallback(
    async (otp: string) => {
      await confirmNewPhone(otp);
      toast.success(TEXT.phone_changed_success);
      navigate(ROUTES.profile ?? "/profile");
    },
    [confirmNewPhone, navigate]
  );

  const handleVerify = async (otp: string) => {
    setLoading(true);
    try {
      if (isChangePhone) {
        await handleVerifyChangePhone(otp);
      } else {
        await handleVerifyLogin(otp);
      }
    } catch (error) {
      toast.error(ERRORS_TEXT.invalid_code);
      setIsWrongCode(true);
      console.error(error);
    } finally {
      setLoading(false);
      setDisabled(false);
    }
  };

  const handleOtpChange = (val: string) => {
    setIsWrongCode(false);
    setCode(val);
    if (val.length === 6) {
      setDisabled(true);
      handleVerify(val);
    }
  };

  const resendCode = async () => {
    if (!phone) return;
    setCode("");
    setIsWrongCode(false);
    setLoading(true);
    try {
      await signInWithPhone(phone);
      toast.success(TEXT.code_sent_again);
    } catch {
      setToastErrorText(ERRORS_TEXT.send_code_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-6 max-w-sm mx-auto">
      <ArrowBack />
      <img src={MobilePNG} alt="Magic trick" />
      <div className="flex-col text-center gap-1 flex">
        <p className="text-title">{TEXT.check_out_phone}</p>
        <p className="text-subtitle">{TEXT.we_have_sent_code}</p>
        <div className="flex justify-center items-center gap-1.5">
          <p className="bg-[#F4E0FF] text-subtitle text-[#594C5D] p-1 font-medium mt-1 inline-flex">
            {phone}
          </p>
          <Edit3Icon
            onClick={() =>
              navigate(isChangePhone ? ROUTES.changePhone : ROUTES.welcome)
            }
            className="cursor-pointer"
            size={20}
            color="#6C6D71"
          />
        </div>
      </div>
      <OTPCode
        otp={code}
        setOtp={handleOtpChange}
        disabled={disabled}
        isWrongCode={isWrongCode}
      />
      {loading && (
        <div className="flex justify-center items-center">
          <Loader2
            size={18}
            className="animate-spin text-black"
            strokeWidth={2.5}
          />
        </div>
      )}
      <div className="flex justify-center items-center gap-1">
        <p className="text-subtitle">{TEXT.did_not_get_code}</p>
        <button
          onClick={resendCode}
          className="text-subtitle cursor-pointer text-purple-400 disabled:opacity-50"
          disabled={loading}
        >
          {TEXT.resend_code}
        </button>
      </div>
    </div>
  );
};
