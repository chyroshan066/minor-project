"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { ReactNode } from "react";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { accessToken, hospitalId, user } = useAuthStore();
  const hydrated = useAuthStore.persist.hasHydrated();

  useEffect(() => {
    if (!hydrated) return;
    if (!accessToken || !hospitalId || !user) router.replace("/login");
  }, [accessToken, hydrated, hospitalId, router, user]);

  if (!accessToken || !hospitalId || !user) {
    if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border border-cyan-400/30 border-t-cyan-300" />
      </div>
    );
    }
    // hydrated but missing auth => redirect in effect; render nothing to avoid flicker
    return null;
  }

  return <>{children}</>;
}

