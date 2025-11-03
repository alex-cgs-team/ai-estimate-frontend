// Хук авторизации по телефону (альтернативный вариант к AuthContainer).
// Отвечает за:
//  - отправку SMS-кода
//  - подтверждение кода
//  - сохранение профиля пользователя в RTDB
//  - выход из аккаунта
// src/components/auth/PhoneAuth.tsx (или где у вас этот импорт)
import { useState, useEffect } from "react";
import type { ConfirmationResult, User as FirebaseUser } from "firebase/auth";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, rtdb } from "../firebase.ts";
import { ref as dbRef, set } from "firebase/database";

export function useAuthTest() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );

  // Слежка за сменой авторизации
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Invisible reCAPTCHA
  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }
    (window as any).recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      { size: "invisible" }
    );
  };

  // Отправка кода
  const sendCode = async (phone: string) => {
    setError(null);
    if (!/^\+\d{10,15}$/.test(phone)) {
      throw new Error("Номер в формате +71234567890");
    }
    setupRecaptcha();
    const result = await signInWithPhoneNumber(
      auth,
      phone,
      (window as any).recaptchaVerifier
    );
    setConfirmation(result);
  };

  // Подтверждение кода
  const verifyCode = async (code: string) => {
    if (!confirmation) throw new Error("Нет подтверждения кода");
    const cred = await confirmation.confirm(code);
    setUser(cred.user);
  };

  // Сохранение профиля (имя + роль)
  const saveProfile = async (name: string, role: string) => {
    if (!auth.currentUser) throw new Error("Неавторизованный");
    const uid = auth.currentUser.uid;
    await set(dbRef(rtdb, `profiles/${uid}`), {
      name,
      role,
      phone: auth.currentUser.phoneNumber,
      createdAt: Date.now(),
    });
  };

  const signOutUser = () => auth.signOut();

  return {
    user,
    loading,
    error,
    sendCode,
    verifyCode,
    saveProfile,
    signOutUser,
  };
}
