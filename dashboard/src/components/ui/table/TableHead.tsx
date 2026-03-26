import { Children } from "@/types";

export const TableHead = ({ children }: Children) => (
  <thead className="align-bottom">{children}</thead>
);
