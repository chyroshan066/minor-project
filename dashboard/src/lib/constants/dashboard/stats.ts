import { PaymentStat, Stat } from "@/types";
import { faPaypal } from "@fortawesome/free-brands-svg-icons";
import {
  faCartShopping,
  faCoins,
  faGlobe,
  faLandmark,
  faScroll,
} from "@fortawesome/free-solid-svg-icons";

export const STATS: Stat[] = [
  {
    id: 1,
    title: "Today's Revenue",
    value: "$53,000",
    change: "+55%",
    icon: faCoins,
  },
  {
    id: 2,
    title: "Pending Appointments",
    value: "2,300",
    change: "+3%",
    icon: faGlobe,
  },
  {
    id: 3,
    title: "New Registrations",
    value: "+3,462",
    change: "-2%",
    icon: faScroll,
    textColor: "text-red-600",
  },
  {
    id: 4,
    title: "Unpaid Invoices",
    value: "$103,430",
    change: "+5%",
    icon: faCartShopping,
  },
];

export const PAYMENT_STATS: PaymentStat[] = [
  {
    id: 1,
    title: "Salary",
    description: "Belong Interactive",
    amount: "+$2000",
    icon: faLandmark,
  },
  {
    id: 2,
    title: "Paypal",
    description: "Freelance Payment",
    amount: "$455.00",
    icon: faPaypal,
    className: "mt-6 md:mt-0",
  },
];
