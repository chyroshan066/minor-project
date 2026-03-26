import { PaymentMethod } from "@/types";

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 1,
    logo: "/images/logos/mastercard.png",
    alt: "Mastercard",
    cardNumber: "**** **** **** 7852",
    className: "mb-6 md:mb-0",
  },
  {
    id: 2,
    logo: "/images/logos/visa.png",
    alt: "Visa",
    cardNumber: "**** **** **** 5248",
  },
];
