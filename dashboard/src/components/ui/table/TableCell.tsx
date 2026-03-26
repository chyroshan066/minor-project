import { Children, ClassName } from "@/types";

interface TableCellProps extends Children, ClassName {
  isLastRow: boolean;
}

export const TableCell = ({
  children,
  className,
  isLastRow,
}: TableCellProps) => (
  <td
    className={`p-2 align-middle bg-transparent ${
      !isLastRow ? "border-b" : "border-b-0"
    } whitespace-nowrap ${className}`}
  >
    {children}
  </td>
);
