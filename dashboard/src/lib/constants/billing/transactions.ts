import { Transaction } from "@/types";

const NEWEST_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    name: "Netflix",
    date: "27 March 2020, at 12:30 PM",
    amount: "- $ 2,500",
    type: "expense",
  },
  {
    id: 2,
    name: "Apple",
    date: "27 March 2020, at 04:30 AM",
    amount: "+ $ 2,000",
    type: "income",
  },
];

const YESTERDAY_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    name: "Stripe",
    date: "26 March 2020, at 13:45 PM",
    amount: "+ $ 750",
    type: "income",
  },
  {
    id: 2,
    name: "HubSpot",
    date: "26 March 2020, at 12:30 PM",
    amount: "+ $ 1,000",
    type: "income",
  },
  {
    id: 3,
    name: "Creative Tim",
    date: "26 March 2020, at 08:30 AM",
    amount: "+ $ 2,500",
    type: "income",
  },
  {
    id: 4,
    name: "Webflow",
    date: "26 March 2020, at 05:00 AM",
    amount: "Pending",
    type: "pending",
  },
];

export const TRANSACTION_GROUPS = [
  {
    title: "Newest",
    data: NEWEST_TRANSACTIONS,
  },
  {
    title: "Yesterday",
    data: YESTERDAY_TRANSACTIONS,
  },
];
