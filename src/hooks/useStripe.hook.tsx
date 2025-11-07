import {
  STRIPE_PUBLISHABLE_KEY,
  API_BASE,
  STRIPE_PRICE_ID,
} from "@/shared/constants/env";
import { ERRORS_TEXT } from "@/shared/constants/text";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import { useAuth } from "./useAuth.hook";
import { useState } from "react";

export const useStripe = () => {
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

  return {
    loading,
    goToCheckout,
  };
};
