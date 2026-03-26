import { TimelineData } from "@/types";
import { faHtml5 } from "@fortawesome/free-brands-svg-icons";
import {
  faBell,
  faCartShopping,
  faCoins,
  faCreditCard,
  faKey,
} from "@fortawesome/free-solid-svg-icons";

export const TIMELINE_ITEMS: TimelineData[] = [
  {
    id: 1,
    title: "$2400, Design changes",
    date: "22 DEC 7:20 PM",
    icon: faBell,
    iconColor: "text-lime-500",
  },
  {
    id: 2,
    title: "New order #1832412",
    date: "21 DEC 11 PM",
    icon: faHtml5,
    iconColor: "text-red-500",
  },
  {
    id: 3,
    title: "Server payments for April",
    date: "21 DEC 9:34 PM",
    icon: faCartShopping,
    iconColor: "text-blue-500",
  },
  {
    id: 4,
    title: "New card added for order #4395133",
    date: "20 DEC 2:20 AM",
    icon: faCreditCard,
    iconColor: "text-orange-500",
  },
  {
    id: 5,
    title: "Unlock packages for development",
    date: "18 DEC 4:54 AM",
    icon: faKey,
    iconColor: "text-purple-600",
  },
  {
    id: 6,
    title: "New order #9583120",
    date: "17 DEC",
    icon: faCoins,
    iconColor: "text-gray-800",
  },
];
