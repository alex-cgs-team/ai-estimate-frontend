import { auth } from "@/firebase";
import { RecaptchaVerifier } from "firebase/auth";

export const ensureCaptcha = async () => {
  if (window.recaptchaVerifier) return window.recaptchaVerifier;
  const el = document.getElementById("recaptcha-container");
  if (el) el.innerHTML = "";
  const v = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
  });
  const id = await v.render();
  window.recaptchaVerifier = v;
  window.recaptchaWidgetId = typeof id === "number" ? id : Number(id);
  return v;
};
