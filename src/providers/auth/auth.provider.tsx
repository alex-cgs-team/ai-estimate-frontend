import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth/auth.store";
import { AuthContext } from "./auth.context";
import {
  getAdditionalUserInfo,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { ensureCaptcha } from "@/utils";
import { auth, rtdb } from "@/firebase";
import type { IProfile } from "@/types/types";
import { ref as dbRef, set } from "firebase/database";

type Props = {
  children: ReactNode;
};

export type AuthContextType = {
  signInWithPhone: (phone: string) => Promise<void>;
  verifyCode: (code: string) => Promise<boolean | undefined>;
  saveProfile: (data: IProfile) => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: IProfile | null) => void;
  user: User | null;
  profile: IProfile | null;
};

export function AuthProvider({ children }: Props) {
  const { setUser, user, profile, setProfile } = useAuthStore();

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

  const saveProfile = useCallback(
    async (data: IProfile) => {
      if (!user) return;

      await set(dbRef(rtdb, `profiles/${user.uid}`), {
        name: data.name,
        role: data.role,
        createdAt: Date.now(),
      });

      setProfile(data);
    },
    [user, setProfile]
  );

  const value: AuthContextType = useMemo(
    () => ({
      signInWithPhone,
      verifyCode,
      saveProfile,
      setUser,
      user,
      profile,
      setProfile,
    }),
    [
      signInWithPhone,
      verifyCode,
      saveProfile,
      setUser,
      user,
      profile,
      setProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
