import { cn } from "@/lib/utils";
import { Children, ClassName } from "@/types";

interface TableHeadProps extends Children, ClassName {}

export const TableHead = ({ children, className }: TableHeadProps) => (
  <thead className={cn("align-bottom")}>{children}</thead>
);
