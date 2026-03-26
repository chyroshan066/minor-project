import { useLayoutConfig } from "@/hooks/useLayoutConfig";
import { Href, Icon, Name } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

interface NavItemProps extends Href, Name, Icon {
  isActive: boolean;
}

// const SIDEBAR_COLORS = [
//   { name: "purple", background: "bg-gradient-brand" },
//   { name: "gray", background: "bg-gradient-dark" },
//   { name: "blue", background: "bg-gradient-soft-blue600-cyan400" },
//   { name: "green", background: "bg-gradient-soft-green600-lime400" },
//   { name: "orange", background: "bg-gradient-soft-red500-yellow400" },
//   { name: "red", background: "bg-gradient-soft-red600-rose400" },
// ] as const;

export const NavItem = ({ isActive, href, name, icon }: NavItemProps) => {
  const { sidenavType } = useLayoutConfig();

  return (
    <li className="mt-0.5 w-full">
      <Link
        className={`py-2.7 text-sm ease-nav-brand my-0 mx-4 flex items-center whitespace-nowrap px-4 transition-colors rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 ${
          isActive
            ? `bg-surface font-semibold text-main ${
                sidenavType === "transparent" && "shadow-soft-xl"
              }`
            : "focus-visible:bg-surface/50"
        }`}
        href={href}
      >
        <div
          className={`shadow-soft-2xl mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-center stroke-0 text-center xl:p-2.5 ${
            isActive ? "bg-gradient-brand" : "bg-surface"
          }`}
        >
          <FontAwesomeIcon
            icon={icon}
            className={isActive ? "text-surface" : ""}
          />
        </div>
        <span className="ml-1 duration-300 opacity-100 pointer-events-none ease-soft">
          {name}
        </span>
      </Link>
    </li>
  );
};
