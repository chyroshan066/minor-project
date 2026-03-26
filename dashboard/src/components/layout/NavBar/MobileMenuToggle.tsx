import { IsProfile, OnToggle } from "@/types";

interface MobileMenuToggleProps extends IsProfile, OnToggle {}

export const MobileMenuToggle = ({
  isProfile,
  onToggle,
}: MobileMenuToggleProps) => (
  <li className="flex items-center pl-4 xl:hidden">
    <button
      onClick={onToggle}
      className={`block p-0 text-sm transition-all rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:ring-offset-5 ${
        isProfile
          ? "ease-soft-in-out text-surface focus-visible:ring-offset-secondary"
          : "ease-nav-brand text-muted bg-transparent border-0 cursor-pointer focus-visible:ring-offset-surface"
      }`}
      data-sidenav-trigger
      type="button"
    >
      <div className="w-4.5 overflow-hidden">
        {[...Array(3)].map((_, index) => (
          // _ tells the computer: "Ignore the value, I only care about the second argument (the number)"
          <i
            key={index}
            className={`ease-soft relative block h-0.5 rounded-sm transition-all ${
              index !== 2 && "mb-0.75"
            } ${isProfile ? "bg-surface" : "bg-muted"}`}
          />
        ))}
      </div>
    </button>
  </li>
);
