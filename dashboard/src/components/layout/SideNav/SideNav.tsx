"use client";

import { memo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useDisclosure } from "@/hooks/useDisclosure";
import { NavItem } from "./NavItem";
import { SideNavHeader } from "./SideNavHeader";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { ACCOUNT_LINKS, getNavLinks, type UserRole } from "@/lib/constants"; // Import the function
import { useLayoutConfig } from "@/hooks/useLayoutConfig";

export const SideNav = memo(() => {
  const { isOpen, toggle, close, contentRef } = useDisclosure(false);
  const pathname = usePathname();
  const { sidenavType } = useLayoutConfig();

  const { user } = useAuthStore(); // Get the logged-in user

  const userRole = user?.role || "receptionist"; 

  // Call the function to get role-specific names and filtered links
  const navLinks = getNavLinks(userRole);

  useEffect(() => {
    window.addEventListener("toggle-sidenav", toggle);
    return () => window.removeEventListener("toggle-sidenav", toggle);
  }, [toggle]);

  return (
    <aside
      ref={contentRef as React.RefObject<HTMLElement>}
      className={`max-w-62.5 z-990 fixed inset-y-0 my-4 ml-4 block w-full rounded-2xl transition-transform duration-200 xl:left-0 xl:translate-x-0 bg-surface shadow-soft-xl ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <ScrollArea className="h-full w-full relative flex flex-col overflow-hidden rounded-2xl">
        <SideNavHeader isOpen={isOpen} close={close} />

        <ul className="flex flex-col pl-0 mb-auto pb-4">
          <li className="w-full mt-2">
            <h6 className="pl-6 ml-2 text-xxs font-bold leading-tight uppercase opacity-60 text-slate-500">
              {userRole} Portal
            </h6>
          </li>

          {navLinks.map((link) => (
            <NavItem
              key={link.id}
              isActive={pathname === link.href}
              href={link.href}
              name={link.name} 
              icon={link.icon}
            />
          ))}

          
          <li className="w-full mt-6">
            <h6 className="pl-6 ml-2 text-xxs font-bold leading-tight uppercase opacity-60 text-slate-500">
              Account
            </h6>
          </li>

          {ACCOUNT_LINKS.map((page) => (
            <NavItem
              key={page.id}
              isActive={pathname === page.href}
              href={page.href}
              name={page.name}
              icon={page.icon}
            />
          ))}
        </ul>
      </ScrollArea>
    </aside>
  );
});

SideNav.displayName = "SideNav";
