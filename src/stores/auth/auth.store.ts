import type { IProfile } from "@/types/types";
import type { User } from "firebase/auth";
import { create } from "zustand";

type AuthState = {
  user: User | null;
  profile: IProfile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: IProfile | null) => void;
  incrementUsage: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  profile: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  incrementUsage: () =>
    set((state) => {
      if (!state.profile) return state;

      return {
        profile: {
          ...state.profile,
          usage: state.profile.usage
            ? { ...state.profile.usage, count: state.profile.usage.count + 1 }
            : { count: 1 },
        },
      };
    }),
}));
