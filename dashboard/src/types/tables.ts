import { Participant } from "./cards";
import { Budget, ClassName, Completion, Id, Logo, Name } from "./common";

export interface TableHeader extends Id, ClassName {
  header: string;
  textAlign?: string;
}

export interface AuthorData extends Id {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  function: {
    role: string;
    department: string;
  };
  status: string;
  employedDate: string;
}

export interface ProjectData extends Id, Completion, Name, Logo, Budget {
  members: Participant[];
}

export interface ProjectData2 extends Id, Logo, Name, Budget, Completion {
  status: "working" | "done" | "canceled";
}
