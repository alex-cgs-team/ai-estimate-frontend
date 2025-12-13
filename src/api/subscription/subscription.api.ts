import { auth } from "@/firebase";
import { api } from "@/shared/config/axios";

export type StripeSubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "paused"
  | "trialing"
  | "unpaid";

export interface SubscriptionInfoResponse {
  success: boolean;
  currentPeriodEnd: number | null;
  autoRenew: boolean;
  status: StripeSubscriptionStatus;
}

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

export const resumeSubscription = async ({
  subscriptionId,
}: {
  subscriptionId: string;
}) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const idToken = await user.getIdToken(true);

  const { data } = await api.post(
    "/resume-subscription",
    { subscriptionId },
    { headers: { Authorization: `Bearer ${idToken}` } }
  );

  return data;
};

export const getSubscriptionInfo = async ({
  subscriptionId,
  uid,
}: {
  subscriptionId: string;
  uid: string;
}): Promise<SubscriptionInfoResponse> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const idToken = await user.getIdToken(true);

  const { data } = await api.post<SubscriptionInfoResponse>(
    "/get-subscription-status",
    { subscriptionId, uid },
    { headers: { Authorization: `Bearer ${idToken}` } }
  );

  return data;
};
