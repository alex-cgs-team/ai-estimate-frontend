import { MobilePNG } from "@/assets/images";
import { ArrowBack, OTPCode } from "@/components";
import { useAuth } from "@/hooks";
import { ROUTES } from "@/shared/constants/routes";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { Edit3Icon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const CodeVerification = () => {
  const [code, setCode] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWrongCode, setIsWrongCode] = useState(false);

  const { verifyCode, signInWithPhone } = useAuth();

  const location = useLocation();
  const phone = location.state?.phone;

  const navigate = useNavigate();

  useEffect(() => {
    if (!phone) {
      navigate("/");
    }
  }, [phone, navigate]);

  const handleVerify = async (code: string) => {
    setLoading(true);
    try {
      const isNewUser = await verifyCode(code);
      if (isNewUser) {
        navigate(ROUTES.onboarding);
      } else {
        navigate(ROUTES.main);
      }
    } catch (error) {
      toast.error(ERRORS_TEXT.invalid_code);
      setIsWrongCode(true);
      console.log(error);
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
    setCode("");
    setIsWrongCode(false);
    setLoading(true);
    try {
      await signInWithPhone(phone);
    } catch (error) {
      toast.error(ERRORS_TEXT.send_code_error);
      console.log(error);
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
            onClick={() => navigate(ROUTES.welcome)}
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
        <p
          onClick={resendCode}
          className="text-subtitle cursor-pointer text-purple-400"
        >
          {TEXT.resend_code}
        </p>
      </div>
    </div>
  );
};
