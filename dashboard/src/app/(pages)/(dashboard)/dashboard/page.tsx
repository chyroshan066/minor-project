import { DashboardView } from "@/components/features/dashboard/DashboardView";
import { Main } from "@/components/layout/Main";
import { NavBar } from "@/components/layout/NavBar";

export default function Home() {
  return (
    <Main className="rounded-xl">
      <NavBar />
      <DashboardView />
    </Main>
  );
}
