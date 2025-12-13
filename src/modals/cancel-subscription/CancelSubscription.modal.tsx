import { cancelSubscription } from "@/api/subscription/subscription.api";
import { Button, Modal } from "@/components";
import { auth } from "@/firebase";
import { useError } from "@/hooks";
import { ERRORS_TEXT, MODALS_TEXT, TEXT } from "@/shared/constants/text";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { UseModalReturn } from "@/types/types";
import { showToast } from "@/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export const CancelSubscriptionModal = ({
  close,
  isVisible,
  toggle,
}: UseModalReturn) => {
  const { profile } = useAuthStore();
  const { setToastErrorText } = useError();

  const [loading, setLoading] = useState(false);

  if (!profile?.usage?.subscriptionId) {
    return null;
  }

  const cancelSubsHandler = async () => {
    const subscriptionId = profile?.usage?.subscriptionId;

    if (!subscriptionId) {
      setToastErrorText("Subscription ID not found.");
      return;
    }

    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      await cancelSubscription({
        subscriptionId: subscriptionId,
      });

      showToast({
        type: "success",
        text: TEXT.auto_renewal,
      });
    } catch {
      setToastErrorText(ERRORS_TEXT.failed_cancel);
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
      title={`${MODALS_TEXT.cancel_subscription}`}
    >
      <p className="text-subtitle text-gray-500 mt-2">
        <span>{MODALS_TEXT.you_will_retain} </span>
        <span>{profile.usage?.subscriptionId} </span>
        <span>{MODALS_TEXT.you_will_retain}</span>
      </p>

      <div className="mt-5 flex gap-3">
        <Button title={TEXT.cancel} onClick={close} type="white" />
        <button
          onClick={cancelSubsHandler}
          className={`border border-[#ECECEC] w-full rounded-xl py-2 cursor-pointer text-white bg-red-500 text-body flex justify-center items-center ${
            loading && "opacity-50"
          }`}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} color="white" />
          ) : (
            TEXT.confirm
          )}
        </button>
      </div>
    </Modal>
  );
};
