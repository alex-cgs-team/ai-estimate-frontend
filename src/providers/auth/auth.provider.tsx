import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth/auth.store";
import { AuthContext } from "./auth.context";
import {
  getAdditionalUserInfo,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  updatePhoneNumber,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { ensureCaptcha } from "@/utils";
import { auth, rtdb } from "@/firebase";
import type { IProfile, ISaveProfile } from "@/types/types";
import { ref as dbRef, set, update } from "firebase/database";

type Props = {
  children: ReactNode;
};

export type AuthContextType = {
  signInWithPhone: (phone: string) => Promise<void>;
  verifyCode: (code: string) => Promise<boolean | undefined>;
  confirmNewPhone: (code: string) => Promise<void>;
  saveProfile: (data: IProfile) => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: IProfile | null) => void;
  incrementUsage: () => void;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<ISaveProfile>) => Promise<void>;
  user: User | null;
  profile: IProfile | null;
};

export function AuthProvider({ children }: Props) {
  const { setUser, user, profile, setProfile, incrementUsage, patchProfile } =
    useAuthStore();

  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );

  const signInWithPhone = useCallback(async (phone: string) => {
    const verifier = await ensureCaptcha();
    const res = await signInWithPhoneNumber(auth, phone, verifier);
    setConfirmation(res);
  }, []);

  const verifyCode = useCallback(
    async (code: string) => {
      if (!confirmation) return;

      const cred = await confirmation.confirm(code);
      setUser(cred.user);

      const info = getAdditionalUserInfo(cred);
      const isNew = info?.isNewUser === true;

      return isNew;
    },
    [confirmation, setUser]
  );

  const confirmNewPhone = useCallback(
    async (code: string) => {
      if (!confirmation) throw new Error("No verification started");
      const credential = PhoneAuthProvider.credential(
        confirmation.verificationId,
        code
      );

      await updatePhoneNumber(auth.currentUser!, credential);
    },
    [confirmation]
  );

  const saveProfile = useCallback(
    async (data: ISaveProfile) => {
      if (!user) return;

      await set(dbRef(rtdb, `profiles/${user.uid}`), {
        name: data.name,
        role: data.role,
        createdAt: Date.now(),
      });

      setProfile({ ...data, usage: { count: 0 } });
    },
    [user, setProfile]
  );

  const updateProfile = useCallback(
    async (data: Partial<ISaveProfile>) => {
      if (!Object.keys(data).length) return;
      if (!user) return;

      await update(dbRef(rtdb, `profiles/${user.uid}`), {
        ...data,
      });

      patchProfile(data);
    },
    [user, patchProfile]
  );

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
    setProfile(null);
  }, [setUser, setProfile]);

  const value: AuthContextType = useMemo(
    () => ({
      signInWithPhone,
      verifyCode,
      saveProfile,
      setUser,
      user,
      profile,
      setProfile,
      incrementUsage,
      signOut,
      updateProfile,
      confirmNewPhone,
    }),
    [
      signInWithPhone,
      verifyCode,
      saveProfile,
      setUser,
      user,
      profile,
      setProfile,
      incrementUsage,
      signOut,
      updateProfile,
      confirmNewPhone,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
