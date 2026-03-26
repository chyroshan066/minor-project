import { BackgroundColor, Children, ClassName, PaddingSize } from "@/types";

interface CardHeaderWrapperProps
  extends Children,
    ClassName,
    PaddingSize,
    BackgroundColor {}

export const CardHeader = ({
  children,
  className,
  paddingSize = 6,
  backgroundColor = "bg-surface",
}: CardHeaderWrapperProps) => (
  <div
    className={`mb-0 rounded-t-2xl border-b-0 ${backgroundColor} p-${paddingSize} pb-0 ${className}`}
  >
    {children}
  </div>
);
