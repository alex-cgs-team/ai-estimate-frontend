import { Button, Modal } from "@/components";
import { useError } from "@/hooks";
import { ERRORS_TEXT, MODALS_TEXT, TEXT } from "@/shared/constants/text";
import type { UseModalReturn } from "@/types/types";
import { useState } from "react";

type RestoreModalProps = {
  restore: () => Promise<void>;
};

export const RestoreDataModal = ({
  close,
  isVisible,
  toggle,
  restore,
}: UseModalReturn & RestoreModalProps) => {
  const [loading, setLoading] = useState(false);

  const { setToastErrorText } = useError();

  const onRestore = async () => {
    setLoading(true);
    try {
      await restore();
    } catch {
      setToastErrorText(ERRORS_TEXT.restore_data_error);
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
      title={MODALS_TEXT.restore_data}
    >
      <div className="flex flex-col gap-8 mt-5">
        <p className="text-subtitle">{MODALS_TEXT.do_you_want_to_restore}</p>
        <div className="flex gap-2">
          <Button title={TEXT.no} onClick={close} type="white" />
          <Button
            title={TEXT.yes}
            onClick={onRestore}
            disabled={loading}
            isLoading={loading}
          />
        </div>
      </div>
    </Modal>
  );
};
