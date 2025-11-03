import { Modal } from "@/components";
import { useAuth } from "@/hooks";
import { FREE_LIMIT } from "@/shared/config/config";
import {
  API_BASE,
  STRIPE_PRICE_ID,
  STRIPE_PUBLISHABLE_KEY,
} from "@/shared/constants/env";
import { ERRORS_TEXT, MODALS_TEXT } from "@/shared/constants/text";
import type { UseModalReturn } from "@/types/types";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export const LimitModal = ({ close, isVisible, toggle }: UseModalReturn) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  const goToCheckout = async () => {
    setLoading(true);
    if (!user) {
      return;
    }
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${API_BASE}/create-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ priceId: STRIPE_PRICE_ID }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const { sessionId } = await res.json();

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe not initialized");

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) console.error("Stripe Checkout error:", error.message);
    } catch {
      toast.error(ERRORS_TEXT.stripe_error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      close={close}
      isVisible={isVisible}
      toggle={toggle}
      title={MODALS_TEXT.free_limit}
    >
      <h3 className="text-lg font-semibold mb-2"></h3>
      <p className="text-subtitle text-gray-600">
        {MODALS_TEXT.used_all} {FREE_LIMIT} {MODALS_TEXT.free_estimations}
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
