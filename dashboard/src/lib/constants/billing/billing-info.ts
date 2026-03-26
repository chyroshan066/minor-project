import { BillingDetail } from "@/types";

export const BILLING_DETAILS: BillingDetail[] = [
  {
    id: 1,
    name: "Oliver Liam",
    details: [
      { label: "Company Name", value: "Viking Burrito" },
      { label: "Email Address", value: "oliver@burrito.com" },
      { label: "VAT Number", value: "FRB1235476" },
    ],
  },
  {
    id: 2,
    name: "Lucas Harper",
    details: [
      { label: "Company Name", value: "Stone Tech Zone" },
      { label: "Email Address", value: "lucas@stone-tech.com" },
      { label: "VAT Number", value: "FRB1235476" },
    ],
  },
  {
    id: 3,
    name: "Ethan James",
    details: [
      { label: "Company Name", value: "Fiber Notion" },
      { label: "Email Address", value: "ethan@fiber.com" },
      { label: "VAT Number", value: "FRB1235476" },
    ],
  },
];
