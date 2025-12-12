import { disableAccount } from "@/api/user/user.api";
import { Modal } from "@/components";
import { auth } from "@/firebase";
import { useAuth, useError } from "@/hooks";
import { ROUTES } from "@/shared/constants/routes";
import { ERRORS_TEXT, MODALS_TEXT, TEXT } from "@/shared/constants/text";
import type { UseModalReturn } from "@/types/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const DeleteModal = ({ close, isVisible, toggle }: UseModalReturn) => {
  const [loading, setLoading] = useState(false);

  const { signOut } = useAuth();
  const { setToastErrorText } = useError();
  const navigate = useNavigate();
  const deleteAccount = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;
    try {
      await disableAccount();
      await signOut();
      navigate(ROUTES.welcome);
    } catch {
      setToastErrorText(ERRORS_TEXT.user_delete_error);
    } finally {
      setLoading(false);
      close();
    }
  };
  return (
    <Modal
      close={close}
      isVisible={isVisible}
      toggle={toggle}
      title={MODALS_TEXT.are_you_sure}
    >
      <div className="flex flex-col gap-8 mt-5">
        <p className="text-subtitle">{MODALS_TEXT.delete_account}</p>
        <div className="flex - justify-between gap-2">
          <button
            onClick={close}
            className="border border-[#ECECEC] w-full rounded-xl py-2 cursor-pointer text-body font-medium text-xl"
          >
            {TEXT.cancel}
          </button>
          <button
            onClick={deleteAccount}
            className={`border border-[#ECECEC] w-full rounded-xl py-2 cursor-pointer bg-red-500 text-body font-medium text-white text-xl flex justify-center items-center ${
              loading && "opacity-50"
            }`}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} color="white" />
            ) : (
              MODALS_TEXT.yes_delete
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
