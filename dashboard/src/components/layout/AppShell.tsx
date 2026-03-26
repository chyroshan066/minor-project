"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut } from "lucide-react";

import { useAuthStore, type Role } from "@/store/authStore";
import { logout as apiLogout } from "@/lib/api/session";

const navForRole: Record<Role, Array<{ label: string; href: string }>> = {
  admin: [
    { label: "Staff", href: "/admin/staff" },
    { label: "Patients", href: "/admin/patients" },
    { label: "Audit logs", href: "/admin/audit-logs" },
    { label: "Inventory", href: "/admin/inventory-alerts" },
  ],
  dentist: [
    { label: "Daily schedule", href: "/dentist/daily-schedule" },
    { label: "Medical records", href: "/dentist/medical-records" },
    { label: "X-ray uploads", href: "/dentist/xray-uploads" },
  ],
  receptionist: [
    { label: "Patient registration", href: "/receptionist/patient-registration" },
    { label: "Appointment booking", href: "/receptionist/appointment-booking" },
    { label: "Billing status", href: "/receptionist/billing" },
  ],
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // Use stable selectors to avoid re-render loops with Zustand + useSyncExternalStore.
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const hospitalId = useAuthStore((s) => s.hospitalId);
  const clearSession = useAuthStore((s) => s.clearSession);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const nav = useMemo(() => {
    if (!role) return [];
    return navForRole[role] ?? [];
  }, [role]);

  async function onLogout() {
    try {
      if (refreshToken) {
        await apiLogout(refreshToken);
      }
    } catch {
      // Ignore backend logout failures; client clears tokens anyway.
      toast.error("Session logout encountered an issue.");
    } finally {
      clearSession();
      router.replace("/login");
    }
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-slate-800 bg-zinc-950/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-200">
              AX
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-100">
                Arthonyx
              </div>
              <div className="text-xs text-slate-400">
                Hospital ID: {hospitalId ?? "—"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm text-slate-100">{user?.name ?? "—"}</div>
              <div className="text-xs text-slate-400">
                {role?.toUpperCase() ?? "—"}
              </div>
            </div>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-zinc-900/40 px-3 py-2 text-sm text-slate-200 hover:bg-zinc-900">
                  Menu
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                className="z-50 w-48 rounded-xl border border-slate-800 bg-zinc-950 p-1 text-slate-100 shadow-xl"
                sideOffset={8}
              >
                <DropdownMenu.Item
                  className="cursor-pointer rounded-lg px-2 py-2 text-sm outline-none hover:bg-slate-800"
                  onSelect={(e) => {
                    e.preventDefault();
                    onLogout();
                  }}
                >
                  <span className="flex items-center gap-2">
                    <LogOut size={16} />
                    Logout
                  </span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 py-5 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-4 rounded-2xl border border-slate-800 bg-zinc-900/30 p-2">
              <div className="px-2 py-1 text-xs font-medium text-slate-400">
                Navigation
              </div>
              <nav className="flex flex-col gap-1">
                {nav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "rounded-xl px-3 py-2 text-sm transition",
                        isActive
                          ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/30"
                          : "text-slate-200 hover:bg-zinc-800",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <section className="min-w-0">
            {nav.length > 0 ? (
              <div className="lg:hidden mb-4">
                <div className="flex flex-wrap gap-2">
                  {nav.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={[
                          "rounded-xl border px-3 py-2 text-sm",
                          isActive
                            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                            : "border-slate-800 bg-zinc-900/20 text-slate-200 hover:bg-zinc-900/50",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}

