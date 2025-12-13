import {
  getSubscriptionInfo,
  resumeSubscription,
  type SubscriptionInfoResponse,
} from "@/api/subscription/subscription.api";
import { useError, useModal } from "@/hooks";
import { CancelSubscriptionModal } from "@/modals";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatSubscriptionDate, showToast } from "@/utils";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Props = {
  autoRenew: boolean;
  subscriptionId: string;
  uid: string;
};

export const SubscriptionSettings = ({
  autoRenew,
  subscriptionId,
  uid,
}: Props) => {
  const [subsInfo, setSubsInfo] = useState<SubscriptionInfoResponse | null>();
  const [loading, setLoading] = useState(false);

  const { profile, setProfile } = useAuthStore();
  const { setToastErrorText } = useError();

  const {
    close: closeSubscription,
    isVisible: isVisibleSubscription,
    toggle: toggleSubscription,
  } = useModal();

  const getSubsInfo = useCallback(async () => {
    try {
      const data = await getSubscriptionInfo({
        subscriptionId,
        uid,
      });
      setSubsInfo(data);
    } catch {
      setToastErrorText(ERRORS_TEXT.something_went_wrong);
      closeSubscription();
    }
  }, [subscriptionId, uid]);

  useEffect(() => {
    getSubsInfo();
  }, [getSubsInfo]);

  if (!subsInfo) {
    return null;
  }

  const renewSubsHandler = async () => {
    if (!subscriptionId) {
      setToastErrorText("Subscription ID not found.");
      return;
    }

    setLoading(true);

    try {
      await resumeSubscription({
        subscriptionId: subscriptionId,
      });

      if (profile && setProfile && profile.usage) {
        setProfile({
          ...profile,
          usage: {
            ...profile.usage,
            autoRenew: true,
          },
        });
      }

      showToast({
        type: "success",
        text: TEXT.subscription_resumed,
      });
    } catch {
      setToastErrorText(ERRORS_TEXT.failed_to_resume);
    } finally {
      setLoading(false);
      closeSubscription();
    }
  };

  const activeUntil = formatSubscriptionDate(subsInfo.currentPeriodEnd);

  return (
    <>
      {autoRenew ? (
        <div className="flex justify-between items-center">
          <p className="text-subtitle text-xl text-black">
            {TEXT.subscription}
          </p>
          <button
            className="
                            w-[177px]
                            rounded-xl
                            bg-white
                            px-[20px] py-[12px]
                            text-sm font-medium 
                            flex items-center justify-center gap-2
                            border border-[#ECE5EF]
                            hover:bg-[#F3DFFF]
                            transition
                            cursor-pointer
                        "
            onClick={toggleSubscription}
          >
            <span className="text-[#594C5D]">{TEXT.cancel_subscription}</span>
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-subtitle text-xl text-black">
            {TEXT.subscription_till} {activeUntil}
          </p>
          <button
            className="
                            w-[177px]
                            rounded-xl
                            bg-white
                            px-[20px] py-[12px]
                            text-sm font-medium 
                            flex items-center justify-center gap-2
                            border border-[#ECE5EF]
                            hover:bg-[#F3DFFF]
                            transition
                            cursor-pointer
                        "
            onClick={renewSubsHandler}
          >
            {loading ? (
              <Loader2
                size={16}
                className="animate-spin text-black"
                strokeWidth={2.5}
              />
            ) : (
              <span className="text-[#594C5D]">{TEXT.resume_subscription}</span>
            )}
          </button>
        </div>
      )}
      <CancelSubscriptionModal
        close={closeSubscription}
        isVisible={isVisibleSubscription}
        toggle={toggleSubscription}
        activeUntil={activeUntil}
      />
    </>
  );
};
