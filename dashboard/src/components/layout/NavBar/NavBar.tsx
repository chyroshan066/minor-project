"use client";

import { usePathname } from "next/navigation";
import { memo } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { SearchBar } from "./SearchBar";
import { NavActions } from "./NavActions";
import { ACCOUNT_LINKS, getNavLinks } from "@/lib/constants";
import { useLayoutConfig } from "@/hooks/useLayoutConfig";

const MERGED_LINKS = [...getNavLinks("dentist"), ...ACCOUNT_LINKS];

export const NavBar = memo(() => {
  const pathname = usePathname();
  const { fixedNavbar } = useLayoutConfig();

  // Handle sidenav burger click
  const handleSidenavToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new Event("toggle-sidenav"));
  };

  const activePage = MERGED_LINKS.find((link) => link.href === pathname);
  const pageName = activePage ? activePage.name : "Dashboard";
  const isProfile = pathname === "/profile";

  const navbarClasses = fixedNavbar
    ? "sticky top-[1%] backdrop-saturate-[200%] backdrop-blur-[30px] bg-[hsla(0,0%,100%,0.8)] shadow-blur z-110"
    : "relative shadow-none";

  return (
    <nav
      className={`flex flex-wrap items-center justify-between py-2 transition-all shadow-none duration-250 ease-soft-in lg:flex-nowrap lg:justify-start ${
        isProfile
          ? "absolute z-20 px-6 text-surface w-full"
          : `px-0 mx-6 rounded-2xl ${navbarClasses}`
      }`}
    >
      <div
        className={`flex items-center justify-between w-full py-1 mx-auto flex-wrap-inherit ${
          isProfile ? "px-6" : "px-4"
        }`}
      >
        <Breadcrumb pageName={pageName} isProfile={isProfile} />
        <div className="flex items-center mt-2 grow sm:mt-0 sm:mr-6 md:mr-0 lg:flex lg:basis-auto">
          <SearchBar />
          <NavActions isProfile={isProfile} onToggle={handleSidenavToggle} />
        </div>
      </div>
    </nav>
  );
});

NavBar.displayName = "NavBar";
