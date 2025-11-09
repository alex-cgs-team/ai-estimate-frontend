import { Button, Modal } from "@/components";
import { useStripe } from "@/hooks";
import { MODALS_TEXT } from "@/shared/constants/text";
import type { UseModalReturn } from "@/types/types";

export const LimitModal = ({ close, isVisible, toggle }: UseModalReturn) => {
  const { goToCheckout, loading } = useStripe();

  return (
    <Modal
      close={close}
      isVisible={isVisible}
      toggle={toggle}
      title={MODALS_TEXT.free_limit}
    >
      <h3 className="text-lg font-semibold mb-2"></h3>
      <p className="text-subtitle text-gray-600">{MODALS_TEXT.used_all}</p>

      <div className="mt-5 space-y-3">
        <Button
          disabled={loading}
          onClick={goToCheckout}
          title={MODALS_TEXT.upgrade_stripe}
          isLoading={loading}
        />

        <Button onClick={close} title={MODALS_TEXT.maybe_later} type="white" />
      </div>
    </Modal>
  );
};
