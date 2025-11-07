import { Modal } from "@/components";
import { useStripe } from "@/hooks";
import { MODALS_TEXT } from "@/shared/constants/text";
import type { UseModalReturn } from "@/types/types";
import { Loader2 } from "lucide-react";

export const StripeModal = ({ close, isVisible, toggle }: UseModalReturn) => {
  const { goToCheckout, loading } = useStripe();

  return (
    <Modal
      close={close}
      isVisible={isVisible}
      toggle={toggle}
      title={MODALS_TEXT.upgrade_plan}
    >
      <p className="text-subtitle text-gray-600">
        {MODALS_TEXT.unlimited_access}
      </p>

      <div className="mt-5 space-y-3">
        <button
          disabled={loading}
          onClick={goToCheckout}
          className="w-full rounded-xl bg-[#6E56CF] hover:opacity-90 text-white font-medium py-3 cursor-pointer flex items-center justify-center"
        >
          {loading ? (
            <Loader2 size={24} color="white" className="animate-spin" />
          ) : (
            <p>{MODALS_TEXT.upgrade_stripe}</p>
          )}
        </button>

        <button
          onClick={close}
          className="w-full rounded-xl border border-[#E5E7F0] bg-white hover:bg-[#F6F8FE] text-gray-700 font-medium py-3 cursor-pointer"
        >
          {MODALS_TEXT.maybe_later}
        </button>
      </div>
    </Modal>
  );
};
