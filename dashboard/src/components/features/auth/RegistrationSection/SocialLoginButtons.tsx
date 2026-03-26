import { Children, ClassName } from "@/types";
import Link from "next/link";

interface SocialLoginButtonProps extends Children, ClassName {}

export const SocialLoginButtons = ({
  children,
  className,
}: SocialLoginButtonProps) => (
  <div className={`w-3/12 max-w-full px-1 flex-0 ${className}`}>
    <Link
      className="inline-block w-full px-6 py-3 mb-4 font-bold text-center text-border uppercase align-middle transition-all bg-transparent border border-gray-200 border-solid rounded-lg shadow-none cursor-pointer hover:scale-102 leading-pro text-xs ease-soft-in tracking-tight-soft bg-150 bg-x-25 hover:bg-transparent hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/50 focus-visible:ring-offset-2 focus-visible:scale-102"
      href="#"
    >
      {children}
    </Link>
  </div>
);
