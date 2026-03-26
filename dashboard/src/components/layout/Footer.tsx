"use client";

import {
  AUTH_FOOTER_LINKS,
  FOOTER_LINKS,
  FOOTER_SOCIAL_LINKS,
} from "@/lib/constants";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Footer = () => {
  const pathname = usePathname();

  const isAuth = pathname === "/login" || pathname === "/register";

  return !isAuth ? (
    <footer className="pt-4">
      <div className="w-full px-6 mx-auto">
        <div className="flex flex-wrap items-center -mx-3 lg:justify-between">
          <div className="w-full max-w-full px-3 mt-0 mb-6 shrink-0 lg:mb-0 lg:w-1/2 lg:flex-none">
            <div className="text-sm leading-normal text-center text-muted lg:text-left">
              © {new Date().getFullYear()}, made with{" "}
              <FontAwesomeIcon icon={faHeart} /> by{" "}
              <a
                href="#"
                className="font-semibold text-main transition-all rounded outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 px-1"
                target="_blank"
              >
                Arthonyx
              </a>{" "}
              for a better web.
            </div>
          </div>
          <div className="w-full max-w-full px-3 mt-0 shrink-0 lg:w-1/2 lg:flex-none">
            <ul className="flex flex-wrap justify-center pl-0 mb-0 list-none lg:justify-end">
              {FOOTER_LINKS.map((link, index) => (
                <li key={index} className="nav-item">
                  <Link
                    href={link.href}
                    className="block px-4 pt-0 pb-1 text-sm font-normal transition-all ease-soft-in-out text-muted rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:text-main"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  ) : (
    <footer className="py-12">
      <div className="container">
        <div className="flex flex-wrap -mx-3">
          <div className="flex-shrink-0 w-full max-w-full mx-auto mb-6 text-center lg:flex-0 lg:w-8/12">
            {AUTH_FOOTER_LINKS.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                target="_blank"
                className="mb-2 mr-4 text-disabled sm:mb-0 xl:mr-12 transition-all rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:text-slate-600 px-2 -mx-2"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex-shrink-0 w-full max-w-full mx-auto mt-2 mb-6 text-center lg:flex-0 lg:w-8/12">
            {FOOTER_SOCIAL_LINKS.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                target="_blank"
                className="mr-6 text-disabled transition-all rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:text-fuchsia-500 p-1 -m-1"
              >
                <FontAwesomeIcon icon={link.icon} className="text-lg" />
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap -mx-3">
          <div className="w-8/12 max-w-full px-3 mx-auto mt-1 text-center flex-0">
            <p className="mb-0 text-disabled">
              Copyright © {new Date().getFullYear()} Software by Arthonyx
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
