import { Children, Title } from "@/types";
import { Card, CardHeader } from "../card";
import { ScrollArea } from "../ScrollArea";

interface DataTableWrapperProps extends Title, Children {}

export const DataTableWrapper = ({
  title,
  children,
}: DataTableWrapperProps) => (
  <div className="flex flex-wrap -mx-3">
    <Card
      outerDivClassName="flex-none"
      innerDivClassName="mb-6 border-transparent shadow-soft-xl bg-surface"
    >
      <CardHeader className="border-b-solid border-b-transparent">
        <h6>{title}</h6>
      </CardHeader>
      <div className="flex-auto px-0 pt-0 pb-2">
        <ScrollArea
          className="management-table-ps relative overflow-hidden touch-pan-y" // "touch-pan-y" allows the PAGE to scroll vertically when we drag our finger on the table.
          options={{
            suppressScrollY: true, // Only horizontal for the table
            wheelPropagation: true, // Allows the page to scroll when we wheel over the table
          }}
        >
          <div className="p-0">{children}</div>
        </ScrollArea>
      </div>
    </Card>
  </div>
);
