import type { IProfile } from "@/types/types";
import type { User } from "firebase/auth";
import { create } from "zustand";

type AuthState = {
  user: User | null;
  profile: IProfile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: IProfile | null) => void;
  incrementUsage: () => void;
  decreaseUsage: () => void;
  patchProfile: (patch: Partial<IProfile>) => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  profile: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  patchProfile: (patch) =>
    set((state) =>
      state.profile ? { profile: { ...state.profile, ...patch } } : state
    ),
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

  decreaseUsage: () =>
    set((state) => {
      if (!state.profile) return state;

      return {
        profile: {
          ...state.profile,
          usage: state.profile.usage
            ? { ...state.profile.usage, count: state.profile.usage.count - 1 }
            : { count: 1 },
        },
      };
    }),
}));
