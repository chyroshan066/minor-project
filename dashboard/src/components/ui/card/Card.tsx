import { Children } from "@/types";

interface CardWrapperProps extends Children {
  outerDivClassName: string;
  innerDivClassName?: string;
  isWidthFull?: boolean;
}

export const Card = ({
  children,
  outerDivClassName,
  innerDivClassName,
  isWidthFull = true,
}: CardWrapperProps) => (
  <div
    className={`${
      isWidthFull && "w-full"
    } max-w-full px-3 ${outerDivClassName}`}
  >
    <div
      className={`relative flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-clip-border ${innerDivClassName}`}
    >
      {children}
    </div>
  </div>
);
