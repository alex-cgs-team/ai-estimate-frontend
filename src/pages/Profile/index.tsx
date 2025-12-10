import { ArrowBack, Button, DropDown, Input } from "@/components";
import { useAuth, useError, useModal } from "@/hooks";
import { DeleteModal } from "@/modals";
import { ROUTES } from "@/shared/constants/routes";
import { ERRORS_TEXT, TEXT } from "@/shared/constants/text";
import { roleLabels, roles } from "@/shared/constants/variables";
import { showToast } from "@/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NameEdit = ({ close }: { close: () => void }) => {
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

const RoleEdit = ({ close }: { close: () => void }) => {
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

export const Profile = () => {
  const { user, profile, signOut, isGoogleProvider } = useAuth();

  const isGoogle = isGoogleProvider();

  const navigate = useNavigate();

  const { close, isVisible, toggle } = useModal();

  const [activeEdit, setActiveEdit] = useState<null | string>(null);

  const info = user
    ? [
        {
          key: "email",
          title: TEXT.email,
          value: user.email,
          onEditClick: () => navigate(ROUTES.changeEmail),
          EditComponent: null,
        },
        {
          key: "name",
          title: TEXT.name,
          value: profile?.name ?? "",
          onEditClick: () => setActiveEdit("name"),
          EditComponent: <NameEdit close={() => setActiveEdit(null)} />,
        },
        {
          key: "role",
          title: TEXT.role,
          value: profile ? roleLabels[profile.role] : "",
          onEditClick: () => setActiveEdit("role"),
          EditComponent: <RoleEdit close={() => setActiveEdit(null)} />,
        },
      ]
    : [];
  return (
    <div>
      <ArrowBack />
      <div className="mt-20 px-6 w-full">
        <div>
          <div className="w-full rounded-xl px-4 py-2 bg-[#F1F3F8]">
            <p className="text-title">{TEXT.personal_info}</p>
          </div>
          <div className="mt-5 px-4 grid grid-cols-[180px_300px_1fr] gap-y-6 items-center">
            {info.map((item) => {
              if (item.key === "email" && isGoogle) {
                return null;
              }
              return (
                <div key={item.title} className="contents">
                  <p className="text-gray-500 text-subtitle">{item.title}</p>
                  {activeEdit === item.key && item.EditComponent ? (
                    <div>{item.EditComponent}</div>
                  ) : (
                    <p className="text-body">
                      {item.value ? item.value : TEXT.not_specified}
                    </p>
                  )}
                  <div className="w-full flex justify-end">
                    <button
                      className="text-body text-[#9b5cf6] cursor-pointer"
                      onClick={item.onEditClick}
                    >
                      {TEXT.edit}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-9">
          <div className="w-full rounded-xl px-4 py-2 bg-[#F1F3F8]">
            <p className="text-title">{TEXT.account}</p>
          </div>
          <div className="px-4 mt-5">
            <div className="flex justify-between items-center">
              <p className="text-subtitle text-xl text-black">
                {TEXT.sign_out}
              </p>
              <button
                className="
                    w-[177px]
                    rounded-xl
                    bg-[#F9E9FF]
                    px-[20px] py-[12px]
                    text-sm font-medium 
                    flex items-center justify-center gap-2
                    hover:bg-[#F3DFFF]
                    transition
                    cursor-pointer
                "
                onClick={signOut}
              >
                <span className="text-[#594C5D]">{TEXT.sign_out}</span>
              </button>
            </div>
            <div className="flex justify-between items-center mt-5">
              <p className="text-subtitle text-xl text-black">
                {TEXT.delete_account}
              </p>
              <button
                className="
                    w-[177px]
                    rounded-xl
                    bg-[#FFE9E9]
                    px-[20px] py-[12px]
                    text-sm font-medium 
                    flex items-center justify-center gap-2
                    hover:bg-[#FFD4D4]
                    transition
                    cursor-pointer
                "
                onClick={toggle}
              >
                <span className="text-red-900">{TEXT.delete_account}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <DeleteModal close={close} isVisible={isVisible} toggle={toggle} />
    </div>
  );
};
