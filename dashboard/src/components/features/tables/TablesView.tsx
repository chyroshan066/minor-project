import { memo } from "react";
import { AuthorsTable } from "./AuthorsTable";
import { ProjectsTable } from "./ProjectsTable";

export const TablesView = memo(() => (
  <>
    <AuthorsTable />
    <ProjectsTable />
  </>
));
