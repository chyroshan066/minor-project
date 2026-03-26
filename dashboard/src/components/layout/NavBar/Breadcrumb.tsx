import { IsProfile } from "@/types";
import Link from "next/link";

interface BreadcrumbProps extends IsProfile {
  pageName: string;
}

export const Breadcrumb = ({ pageName, isProfile }: BreadcrumbProps) => (
  <nav>
    <ol
      className={`flex flex-wrap pt-1 mr-12 bg-transparent rounded-lg sm:mr-16 ${
        isProfile && "pl-2 pr-4"
      }`}
    >
      <li className="text-sm leading-normal">
        <Link
          className={`opacity-50 rounded-sm outline-none focus-visible:no-underline focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:ring-offset-3 ${
            isProfile
              ? "focus-visible:ring-offset-secondary"
              : "text-main focus-visible:ring-offset-surface"
          }`}
          href="#"
        >
          Pages
        </Link>
      </li>
      <li
        className={`text-sm pl-2 capitalize leading-normal before:float-left before:pr-2 before:content-['/'] ${
          !isProfile && "text-main before:text-gray-600"
        }`}
        aria-current="page"
      >
        {pageName}
      </li>
    </ol>
    <h6
      className={`font-bold capitalize ${
        isProfile ? "mb-2 ml-2 text-surface" : "mb-0"
      }`}
    >
      {pageName}
    </h6>
  </nav>
);
