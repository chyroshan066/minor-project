import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Role = "admin" | "dentist" | "receptionist";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  hospital_id: string;
  hospital_name: string; 
  created_at: string;
  avatar_url?: string;
};

type AuthSession = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  hospitalId: string | null;
  hospitalName: string | null;
  role: Role | null;
};

type AuthActions = {
  setSession: (session: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  // --- ADDED THIS ACTION ---
  updateUser: (userData: Partial<AuthUser>) => void; 
  clearSession: () => void;
};

export const useAuthStore = create<AuthSession & AuthActions>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hospitalId: null,
      hospitalName: null,
      role: null,

      setSession: ({ accessToken, refreshToken, user }) =>
        set({
          accessToken,
          refreshToken,
          user,
          hospitalId: user.hospital_id,
          hospitalName: user.hospital_name ?? null,
          role: user.role,
        }),

      setTokens: ({ accessToken, refreshToken }) =>
        set({
          accessToken,
          refreshToken,
        }),

      // --- NEW: LOGIC TO UPDATE USER IMMEDIATELY ---
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          hospitalId: null,
          hospitalName: null,
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
        hospitalName: state.hospitalName,
        role: state.role,
      }),
    }
  )
);