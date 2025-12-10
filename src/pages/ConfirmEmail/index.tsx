import { MobilePNG } from "@/assets/images";
import { useAuth, useError } from "@/hooks";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const ConfirmEmail = () => {
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const { resendVerifyEmail } = useAuth();
  const { setToastErrorText } = useError();

  const location = useLocation();
  const emailToCheck = location.state?.email;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const handleResendEmail = async () => {
    if (timer > 0) return;

    setLoading(true);
    try {
      await resendVerifyEmail();
      setTimer(60);
    } catch {
      setToastErrorText(ERRORS_TEXT.something_went_wrong);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-20 flex-col gap-3 max-w-sm mx-auto">
      <img src={MobilePNG} alt="Magic trick" />
      <div className="flex-col text-center gap-1 flex">
        <p className="text-title">{TEXT.check_out_email}</p>
        <p className="text-subtitle">{TEXT.we_have_sent_link}</p>
        <div className="flex justify-center items-center gap-1.5">
          <p className="bg-[#F4E0FF] text-subtitle text-[#594C5D] p-1 font-medium mt-1 inline-flex">
            {emailToCheck}
          </p>
        </div>
        <>
          {loading ? (
            <div className="flex justify-center mt-2">
              <Loader2
                size={24}
                className="animate-spin text-black"
                strokeWidth={2.5}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center gap-1 mt-2">
              {timer > 0 ? (
                <p className="text-subtitle text-gray-400">
                  {TEXT.resend_email} in {timer}
                </p>
              ) : (
                <>
                  <p className="text-subtitle">{TEXT.did_not_get_email}</p>
                  <button
                    onClick={handleResendEmail}
                    className="text-subtitle cursor-pointer text-purple-400 hover:text-purple-500 disabled:opacity-50 transition-colors"
                    disabled={loading}
                  >
                    {TEXT.resend_email}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      </div>
    </div>
  );
};
