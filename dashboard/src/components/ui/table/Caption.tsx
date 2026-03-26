import { Children, ClassName } from "@/types";

interface CaptionProps extends Children, ClassName {}

export const Caption = ({ children, className }: CaptionProps) => (
  <span className={`text-xs font-semibold leading-tight ${className}`}>
    {children}
  </span>
);
