import type { IProfile } from "@/types/types";
import type { User } from "firebase/auth";
import { create } from "zustand";

type AuthState = {
  user: User | null;
  profile: IProfile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: IProfile | null) => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  profile: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
}));
