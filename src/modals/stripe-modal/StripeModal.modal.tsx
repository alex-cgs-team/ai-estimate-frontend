import { Button, Modal } from "@/components";
import { useStripe } from "@/hooks";
import { MODALS_TEXT } from "@/shared/constants/text";
import type { UseModalReturn } from "@/types/types";

export const StripeModal = ({ close, isVisible, toggle }: UseModalReturn) => {
  const { goToCheckout, loading } = useStripe();

  return (
    <Modal
      close={close}
      isVisible={isVisible}
      toggle={toggle}
      title={MODALS_TEXT.upgrade_plan}
    >
      <p className="text-subtitle text-gray-600 mt-2">
        {MODALS_TEXT.unlimited_access}
      </p>

      <div className="mt-5 space-y-3">
        <Button
          title={MODALS_TEXT.upgrade_stripe}
          disabled={loading}
          onClick={goToCheckout}
          isLoading={loading}
        />
        <Button title={MODALS_TEXT.maybe_later} onClick={close} type="white" />
      </div>
    </Modal>
  );
};
