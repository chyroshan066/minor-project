import { AuthorData, TableHeader } from "@/types";

export const AUTHORS_TABLE_HEADERS: TableHeader[] = [
  {
    id: 1,
    header: "Author",
    textAlign: "left",
  },
  {
    id: 2,
    header: "Function",
    className: "pl-2",
    textAlign: "left",
  },
  {
    id: 3,
    header: "Status",
    textAlign: "center",
  },
  {
    id: 4,
    header: "Employed",
    textAlign: "center",
  },
  {
    id: 5,
    header: "",
  },
];

export const AUTHORS_TABLE_DATA: AuthorData[] = [
  {
    id: 1,
    user: {
      name: "John Michael",
      email: "john@creative-tim.com",
      avatar: "/images/random/team-2.jpg",
    },
    function: {
      role: "Manager",
      department: "Organization",
    },
    status: "Online",
    employedDate: "23/04/18",
  },
  {
    id: 2,
    user: {
      name: "Alexa Liras",
      email: "alexa@creative-tim.com",
      avatar: "/images/random/team-3.jpg",
    },
    function: {
      role: "Programator",
      department: "Developer",
    },
    status: "Offline",
    employedDate: "11/01/19",
  },
  {
    id: 3,
    user: {
      name: "Laurent Perrier",
      email: "laurent@creative-tim.com",
      avatar: "/images/random/team-4.jpg",
    },
    function: {
      role: "Executive",
      department: "Projects",
    },
    status: "Online",
    employedDate: "19/09/17",
  },
  {
    id: 4,
    user: {
      name: "Michael Levi",
      email: "michael@creative-tim.com",
      avatar: "/images/random/team-3.jpg",
    },
    function: {
      role: "Programator",
      department: "Developer",
    },
    status: "Online",
    employedDate: "24/12/08",
  },
  {
    id: 5,
    user: {
      name: "Richard Gran",
      email: "richard@creative-tim.com",
      avatar: "/images/random/team-2.jpg",
    },
    function: {
      role: "Manager",
      department: "Executive",
    },
    status: "Offline",
    employedDate: "04/10/21",
  },
  {
    id: 6,
    user: {
      name: "Miriam Eric",
      email: "miriam@creative-tim.com",
      avatar: "/images/random/team-4.jpg",
    },
    function: {
      role: "Programtor",
      department: "Developer",
    },
    status: "Offline",
    employedDate: "14/09/20",
  },
];
