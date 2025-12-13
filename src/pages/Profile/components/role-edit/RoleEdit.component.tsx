import { Button, DropDown } from "@/components";
import { useAuth, useError } from "@/hooks";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { roles } from "@/shared/constants/variables";
import { showToast } from "@/utils";
import { useState } from "react";

export const RoleEdit = ({ close }: { close: () => void }) => {
  const { profile, user, updateProfile } = useAuth();
  const [role, setRole] = useState(profile ? profile.role : "");
  const [loading, setLoading] = useState(false);

  const { setToastErrorText } = useError();

  if (!user) {
    return null;
  }

  const update = async () => {
    setLoading(true);
    try {
      await updateProfile({ role });
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
      <DropDown value={role} onChange={setRole} options={roles} />
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
