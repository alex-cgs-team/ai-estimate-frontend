import { auth, googleProvider, rtdb } from "@/firebase";
import { ROUTES } from "@/shared/constants/routes";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { IProfile, ISaveProfile } from "@/types/types";
import { ensureCaptcha } from "@/utils";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAdditionalUserInfo,
  PhoneAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  updatePhoneNumber,
  verifyBeforeUpdateEmail,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { ref as dbRef, set, update } from "firebase/database";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./auth.context";

type Props = {
  children: ReactNode;
};

type SignIn = {
  email: string;
  password: string;
};

type ChangeEmail = { newEmail: string; password: string };

export type AuthContextType = {
  signInWithPhone: (phone: string) => Promise<void>;
  verifyCode: (code: string) => Promise<boolean | undefined>;
  confirmNewPhone: (code: string) => Promise<void>;
  saveProfile: (data: IProfile) => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: IProfile | null) => void;
  incrementUsage: () => void;
  decreaseUsage: () => void;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<ISaveProfile>) => Promise<void>;
  signInWithEmailPassword: (data: SignIn) => Promise<User>;
  createUserWithEmailPassword: (data: SignIn) => Promise<void>;
  resendVerifyEmail: (user?: User) => Promise<void>;
  changeEmail: (data: ChangeEmail) => Promise<void>;
  sendForgotPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<User>;
  isGoogleProvider: () => boolean;
  user: User | null;
  profile: IProfile | null;
};

export function AuthProvider({ children }: Props) {
  const {
    setUser,
    user,
    profile,
    setProfile,
    incrementUsage,
    patchProfile,
    decreaseUsage,
  } = useAuthStore();

  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );

  const [tempUser, setTempUser] = useState<User | null>(null);
  const redirectVerifiedEmailUrl = `${window.location.origin}/${ROUTES.welcome}?email_verified=true`;
  const redirectChangedEmailUrl = `${window.location.origin}/${ROUTES.welcome}?email_changed=true`;
  const redirectForgotPasswordUrl = `${window.location.origin}/${ROUTES.welcome}`;

  const signInWithPhone = useCallback(async (phone: string) => {
    const verifier = await ensureCaptcha();
    const res = await signInWithPhoneNumber(auth, phone, verifier);
    setConfirmation(res);
  }, []);

  const signInWithEmailPassword = useCallback(
    async ({ email, password }: SignIn) => {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      if (!user.emailVerified) {
        throw new Error("Email didn't verified");
      }
      setTempUser(null);
      setUser(user);
      return user;
    },
    [setUser]
  );

  const signInWithGoogle = useCallback(async () => {
    const { user } = await signInWithPopup(auth, googleProvider);
    setTempUser(null);
    setUser(user);
    return user;
  }, [setUser]);

  const isGoogleProvider = useCallback(() => {
    return user
      ? user.providerData.some(
          (provider) => provider.providerId === "google.com"
        )
      : false;
  }, [user]);

  const createUserWithEmailPassword = useCallback(
    async ({ email, password }: SignIn) => {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await sendEmailVerification(user, {
        url: redirectVerifiedEmailUrl,
      });

      setTempUser(user);
    },
    [redirectVerifiedEmailUrl]
  );

  const resendVerifyEmail = useCallback(
    async (user?: User) => {
      const targetUser = user || tempUser;

      if (!targetUser) {
        throw new Error("User not found");
      }

      await sendEmailVerification(targetUser, {
        url: redirectVerifiedEmailUrl,
      });
    },
    [redirectVerifiedEmailUrl, tempUser]
  );

  const changeEmail = useCallback(
    async ({ newEmail, password }: ChangeEmail) => {
      if (!user || !user.email) throw new Error("User not found");
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, newEmail, {
        url: redirectChangedEmailUrl,
      });
    },
    [user, redirectChangedEmailUrl]
  );

  const sendForgotPassword = useCallback(
    async (email: string) => {
      const actionCodeSettings = {
        url: redirectForgotPasswordUrl,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
    },
    [redirectForgotPasswordUrl]
  );

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
      decreaseUsage,
      signOut,
      updateProfile,
      confirmNewPhone,
      signInWithEmailPassword,
      createUserWithEmailPassword,
      resendVerifyEmail,
      changeEmail,
      sendForgotPassword,
      signInWithGoogle,
      isGoogleProvider,
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
      decreaseUsage,
      signInWithEmailPassword,
      createUserWithEmailPassword,
      resendVerifyEmail,
      changeEmail,
      sendForgotPassword,
      signInWithGoogle,
      isGoogleProvider,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
