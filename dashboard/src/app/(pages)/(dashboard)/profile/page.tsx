import { Footer } from "@/components/layout/Footer";
import { NavBar } from "@/components/layout/NavBar/NavBar";
import { Main } from "@/components/layout/Main";
import { ProfileHeader } from "@/components/features/profile/ProfileHeader/ProfileHeader";
import { ProfileSettingsSection } from "@/components/features/profile/ProfileSettingsSection";

export default function Profile() {
  return (
    <Main className="bg-gray-50">
      <NavBar />
      <ProfileHeader />
      <div className="w-full p-6 mx-auto">
        <ProfileSettingsSection />
        <Footer />
      </div>
    </Main>
  );
}
