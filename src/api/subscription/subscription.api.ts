import { auth } from "@/firebase";
import { api } from "@/shared/config/axios";

export const cancelSubscription = async ({
  subscriptionId,
}: {
  subscriptionId: string;
}) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const idToken = await user.getIdToken(true);
  const { data } = await api.post(
    "/cancel-subscription",
    { subscriptionId },
    { headers: { Authorization: `Bearer ${idToken}` } }
  );
  return data;
};
