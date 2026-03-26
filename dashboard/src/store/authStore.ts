import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Role = "admin" | "dentist" | "receptionist";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  hospital_id: string;
  created_at: string;
  avatar_url?: string;
};

type AuthSession = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  hospitalId: string | null;
  role: Role | null;
  avatarurl?: string | null;
};

type AuthActions = {
  setSession: (session: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthSession & AuthActions>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hospitalId: null,
      role: null,

      setSession: ({ accessToken, refreshToken, user }) =>
        set({
          accessToken,
          refreshToken,
          user,
          hospitalId: user.hospital_id,
          role: user.role,
        }),

      setTokens: ({ accessToken, refreshToken }) =>
        set({
          accessToken,
          refreshToken,
        }),

      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          hospitalId: null,
          role: null,
        }),
    }),
    {
      name: "auth-session",
      version: 1,
      storage:
        typeof window === "undefined"
          ? {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
          : createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        hospitalId: state.hospitalId,
        role: state.role,
      }),
    }
  )
);

