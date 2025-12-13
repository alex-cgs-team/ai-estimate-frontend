import { GoogleSVG } from "@/assets/icons";
import { rtdb } from "@/firebase";
import { useAuth, useError } from "@/hooks";
import { ROUTES } from "@/shared/constants/routes";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { get, ref } from "firebase/database";
import { useNavigate } from "react-router-dom";

export const GoogleButton = () => {
  const { signInWithGoogle } = useAuth();

  const navigate = useNavigate();

  const { setToastErrorText } = useError();

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      const snap = await get(ref(rtdb, `profiles/${user.uid}`));
      if (snap.val()) {
        navigate(ROUTES.main);
      } else {
        navigate(ROUTES.onboarding);
      }
    } catch {
      setToastErrorText(ERRORS_TEXT.something_went_wrong);
    }
  };

  return (
    <button
      className="border border-[#ECECEC] w-full rounded-xl py-2 cursor-pointer flex justify-center items-center gap-2 bg-white"
      onClick={handleGoogleSignIn}
    >
      <GoogleSVG />
      <span className="text-body font-medium leading-[1.4]">
        {TEXT.log_in_with_google}
      </span>
    </button>
  );
};
