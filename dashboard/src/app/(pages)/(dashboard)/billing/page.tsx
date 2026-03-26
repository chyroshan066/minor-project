import { Billing } from "@/components/features/billing/Billing";
import { Footer } from "@/components/layout/Footer";
import { Main } from "@/components/layout/Main";
import { NavBar } from "@/components/layout/NavBar";

export default function BillingPage() {
  return (
    <Main className="rounded-xl">
      <NavBar />
      <div className="w-full px-6 py-6 mx-auto">
        <Billing />
        <Footer />
      </div>
    </Main>
  );
}
