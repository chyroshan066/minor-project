"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/store/authStore";
import { useAuthStore } from "@/store/authStore";
import type { ReactNode } from "react";

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const router = useRouter();
  const { role: currentRole } = useAuthStore();

  useEffect(() => {
    if (currentRole && currentRole !== role) router.replace("/login");
  }, [currentRole, router, role]);

  if (currentRole && currentRole !== role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-red-200">You do not have access to this area.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

