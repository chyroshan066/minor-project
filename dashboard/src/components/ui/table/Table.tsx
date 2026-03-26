import { Children, ClassName } from "@/types";

interface TableProps extends Children, ClassName {}

export const Table = ({ children, className }: TableProps) => (
  <table
    className={`items-center w-full mb-0 align-top border-border text-muted ${className}`}
  >
    {children}
  </table>
);
