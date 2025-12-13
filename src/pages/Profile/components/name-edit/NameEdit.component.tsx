import { Button, Input } from "@/components";
import { useAuth, useError } from "@/hooks";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { showToast } from "@/utils";
import { useState } from "react";

export const NameEdit = ({ close }: { close: () => void }) => {
  const { profile, user, updateProfile } = useAuth();
  const [name, setName] = useState(profile ? profile.name : "");
  const [loading, setLoading] = useState(false);

  const { setToastErrorText } = useError();

  if (!user) {
    return null;
  }

  const update = async () => {
    setLoading(true);
    try {
      await updateProfile({ name });
      showToast({
        type: "success",
        text: TEXT.profile_updated,
      });
      close();
    } catch {
      setToastErrorText(ERRORS_TEXT.profile_update_error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Input value={name} onChange={setName} />
      <div className="flex gap-1 mt-2">
        <Button
          title={TEXT.save}
          onClick={update}
          type="black"
          isLoading={loading}
          disabled={loading}
        />
        <Button title={TEXT.cancel} onClick={close} type="white" />
      </div>
    </div>
  );
};
