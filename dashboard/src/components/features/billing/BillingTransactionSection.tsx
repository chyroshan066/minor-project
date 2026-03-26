import { BillingInfoCard } from "../../cards/BillingInfoCard";
import { TransactionCard } from "../../cards/TransactionCard";

export const BillingTransactionSection = () => (
  <div className="flex flex-wrap -mx-3">
    <BillingInfoCard />
    <TransactionCard />
  </div>
);
