import { ClassName, Color } from "@/types";

interface SeparatorProps extends ClassName, Color {}

export const Separator = ({
  className,
  color = "black/40",
}: SeparatorProps) => (
  <hr
    className={`h-px ${className} bg-transparent bg-gradient-to-r from-transparent via-${color} to-transparent`}
  />
);
