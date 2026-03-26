import { Children, ClassName } from "@/types";

interface MainProps extends Children, ClassName {}

export const Main = ({ children, className }: MainProps) => (
  <main
    className={`ease-soft-in-out xl:ml-68.5 relative min-h-screen transition-all duration-200 ${className}`}
  >
    {children}
  </main>
);
