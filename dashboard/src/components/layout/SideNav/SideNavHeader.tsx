import { Separator } from "@/components/ui/Separator";
import { useLayoutConfig } from "@/hooks/useLayoutConfig";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

interface SideNavHeaderProps {
  isOpen: boolean;
  close: () => void;
}

export const SideNavHeader = ({ isOpen, close }: SideNavHeaderProps) => {
  const { sidenavType } = useLayoutConfig();

  const sideNavHeaderBackgroundClass =
    sidenavType === "transparent"
      ? "min-[1200px]:bg-surface-ground"
      : "min-[1200px]:bg-surface";

  return (
    <div
      className={`sticky top-0 z-20 max-xl:bg-surface ${sideNavHeaderBackgroundClass}`}
    >
      <div className="h-19.5 px-6 py-6">
        <button
          type="button"
          onClick={close}
          className={`absolute top-0 right-0 p-4 transition-all duration-200 rounded-lg outline-none xl:hidden ${
            isOpen ? "block" : "hidden"
          } text-disabled opacity-50 cursor-pointer hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-ring/50`}
          aria-label="Close Sidebar"
        >
          <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
        </button>
        <Link
          className="block m-0 text-sm whitespace-nowrap text-main rounded-lg outline-none transition-all px-2 -mx-2 py-1 -my-1 focus-visible:ring-2 focus-visible:ring-primary-ring/50"
          href="/"
          target="_blank"
        >
          <Image
            src="/images/logo-ct.png"
            width={32}
            height={32}
            className="inline h-full max-w-full transition-all duration-200 ease-nav-brand max-h-8"
            alt="main_logo"
            priority
          />
          <span className="ml-1 font-semibold transition-all duration-200 ease-nav-brand">
            Soft UI Dashboard
          </span>
        </Link>
      </div>

      <Separator className="mt-0" />
    </div>
  );
};
