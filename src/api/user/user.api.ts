import { auth } from "@/firebase";
import { api } from "@/shared/config/axios";

export const disableAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const idToken = await user.getIdToken(true);
  const { data } = await api.post(
    "/account/disable",
    {},
    { headers: { Authorization: `Bearer ${idToken}` } }
  );
  return data;
};
