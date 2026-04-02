import { Separator } from "@/components/ui/Separator";
import { useLayoutConfig } from "@/hooks/useLayoutConfig";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

interface SideNavHeaderProps {
  isOpen: boolean;
  close: () => void;
}

export const SideNavHeader = ({ isOpen, close }: SideNavHeaderProps) => {
  const { sidenavType } = useLayoutConfig();
  const { user } = useAuthStore();

  const sideNavHeaderBackgroundClass =
    sidenavType === "transparent"
      ? "min-[1200px]:bg-surface-ground"
      : "min-[1200px]:bg-surface";

  const hospitalInitial = user?.hospital_name
    ? user.hospital_name.charAt(0).toUpperCase()
    : "G";

  return (
    <div
      className={`sticky top-0 z-20 max-xl:bg-surface ${sideNavHeaderBackgroundClass}`}
    >
      {/* Close button — mobile only */}
      <button
        type="button"
        onClick={close}
        className={`absolute top-3 right-3 z-30 flex items-center justify-center w-8 h-8 rounded-md text-disabled opacity-50 transition-all duration-150 hover:opacity-100 hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-primary-ring/50 outline-none xl:hidden ${
          isOpen ? "flex" : "hidden"
        }`}
        aria-label="Close Sidebar"
      >
        <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
      </button>

      {/* Header content */}
      <div className="px-5 py-4">
        <Link
          href="/"
          target="_blank"
          className="group flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 transition-all"
        >
          {/* Logo mark */}
          <div className="relative flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center shadow-sm ring-1 ring-black/5">
            <Image
              src="/images/logo-ct.png"
              width={22}
              height={22}
              className="object-contain"
              alt="Logo"
              priority
            />
          </div>

          {/* Text block */}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold tracking-tight text-main leading-tight truncate group-hover:text-primary transition-colors duration-150">
              Arthonyx Dashboard
            </span>
            <span className="text-[11px] font-medium text-slate-400 leading-tight truncate mt-0.5">
              {user?.hospital_name || "Guest Hospital"}
            </span>
          </div>
        </Link>

        {/* Subtle hospital badge */}
        {user?.hospital_name && (
          <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-100">
            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {hospitalInitial}
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate leading-none">
              {user.hospital_name}
            </span>
            <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 flex-shrink-0">
              Active
            </span>
          </div>
        )}
      </div>

      <Separator className="mt-0" />
    </div>
  );
};