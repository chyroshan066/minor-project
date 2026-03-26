import { Alt, Amount, ClassName, Date, Id, Logo, Name } from "./common";

export interface PaymentMethod extends Id, Logo, Alt, ClassName {
  cardNumber: string;
}

export interface Invoice extends Id, Date, Amount {}

export type TransactionType = "income" | "expense" | "pending";

export interface Transaction extends Id, Name, Amount, Date {
  type: TransactionType;
}

export interface BillingDetail extends Id, Name {
  details: {
    label: string;
    value: string;
  }[];
}
