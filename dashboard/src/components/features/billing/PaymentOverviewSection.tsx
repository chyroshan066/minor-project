import { CreditCard } from "@/components/cards/CreditCard";
import { InvoiceCard } from "@/components/cards/InvoiceCard";
import { PaymentMethodCard } from "@/components/cards/PaymentMethodCard";
import { StatMiniCard } from "@/components/cards/StatMiniCard";

export const PaymentOverviewSection = () => (
  <div className="flex flex-wrap -mx-3">
    <div className="max-w-full px-3 lg:w-2/3 lg:flex-none">
      <div className="flex flex-wrap -mx-3">
        <CreditCard />
        <StatMiniCard />
        <PaymentMethodCard />
      </div>
    </div>
    <InvoiceCard />
  </div>
);
