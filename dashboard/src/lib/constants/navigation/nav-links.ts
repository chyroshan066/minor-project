// import { Link } from "@/types";
// import {
//   faCity,
//   faCreditCard,
//   faShop,
// } from "@fortawesome/free-solid-svg-icons";

// export const NAV_LINKS: Link[] = [
//   {
//     id: 1,
//     name: "Dashboard",
//     href: "/dashboard",
//     icon: faShop,
//   },
//   {
//     id: 2,
//     name: "Staff",
//     href: "/tables",
//     icon: faCity,
//   },
//   {
//     id: 3,
//     name: "Billing & Appointments",
//     href: "/billing",
//     icon: faCreditCard,
//   },
// ];
import { 
  faCity, 
  faCreditCard, 
  faShop 
} from "@fortawesome/free-solid-svg-icons";

export type UserRole = "admin" | "dentist" | "receptionist";

export const getNavLinks = (role: UserRole) => {
  return [
    {
      id: 1,
      // Slot 1: Primary View
      name: role === "receptionist" ? "Dashboard" : "Dashboard",
      href: "/dashboard",
      icon: faShop,
    },
    {
      id: 2,
      // Slot 2: Management/Data View
      name: role === "admin" ? "Staff Management" : role === "dentist" ? "My Schedule" : "Patient Records",
      href: "/tables",
      icon: faCity,
    },
    {
      id: 3,
      // Slot 3: Operations View
      name: role === "admin" ? "Audit Logs" : role === "dentist" ? "Medical Records" : "Create Appointments",
      href: "/billing",
      icon: faCreditCard,
    },
  ];
  // Note: We removed the .filter() because you want all 3 items visible for everyone.
};