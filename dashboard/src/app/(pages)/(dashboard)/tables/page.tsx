import { NavBar } from "@/components/layout/NavBar/NavBar";
import { Footer } from "@/components/layout/Footer";
import { Main } from "@/components/layout/Main";
import { TablesView } from "@/components/features/tables/TablesView";

export default function Tables() {
  return (
    <Main className="rounded-xl">
      <NavBar />
      <div className="w-full px-6 py-6 mx-auto">
        <TablesView />
        <Footer />
      </div>
    </Main>
  );
}
