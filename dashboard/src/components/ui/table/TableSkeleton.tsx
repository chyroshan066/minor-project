import { DataTableWrapper } from "./DataTableWrapper";
import { Table } from "./Table";
import { TableHead } from "./TableHead";
import { TableCell } from "./TableCell";
import { Skeleton } from "../Skeleton";
import { Title } from "@/types";

interface TableSkeletonProps extends Title {
  // title: string;
  rowCount?: number;
  columnHeaders: string[]; // To match the header layout
}

export const TableSkeleton = ({ 
  title, 
  rowCount = 5, 
  columnHeaders 
}: TableSkeletonProps) => (
  <DataTableWrapper title={title}>
    <Table>
      <TableHead>
        <tr>
          {columnHeaders.map((header, i) => (
            <th key={i} className="table-header text-xxs font-bold uppercase opacity-70 p-2 text-left">
              {header}
            </th>
          ))}
        </tr>
      </TableHead>
      <tbody>
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {columnHeaders.map((_, colIndex) => (
              <TableCell 
                key={colIndex} 
                isLastRow={rowIndex === rowCount - 1}
                className="py-4"
              >
                {/* Column 0 usually has an Avatar + Text layout */}
                {colIndex === 0 ? (
                  <div className="flex items-center px-2">
                    <Skeleton className="h-9 w-9 rounded-xl mr-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2 w-32" />
                    </div>
                  </div>
                ) : (
                  /* Standard data columns */
                  <div className="px-2">
                    <Skeleton className="h-3 w-full max-w-[100px]" />
                  </div>
                )}
              </TableCell>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  </DataTableWrapper>
);