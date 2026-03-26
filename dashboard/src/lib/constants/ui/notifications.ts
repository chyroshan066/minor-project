import { Notification } from "@/types";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";

export const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "image",
    asset: "/images/random/team-2.jpg",
    href: "#",
    title: "New message",
    message: "from Laur",
    time: "13 minutes ago",
  },
  {
    id: 2,
    type: "logo",
    asset: "/images/random/small-logos/logo-spotify.svg",
    href: "#",
    title: "New album",
    message: "by Travis Scott",
    time: "1 day",
  },
  {
    id: 3,
    type: "icon",
    asset: faCreditCard,
    href: "#",
    title: "Payment successfully completed",
    time: "2 days",
  },
];
