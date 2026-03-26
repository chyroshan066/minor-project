import { ProfileDetailCard } from "@/components/cards/ProfileDetailCard";
import { ProjectGalleryCard } from "@/components/cards/ProjectGalleryCard";
import { RecentChatsCard } from "@/components/cards/RecentChatsCard";
import { SettingsToggleCard } from "@/components/cards/SettingsToggleCard";

export const ProfileSettingsSection = () => (
  <div className="flex flex-wrap -mx-3">
    <SettingsToggleCard />
    <ProfileDetailCard />
    <RecentChatsCard />
    {/* <ProjectGalleryCard /> */}
  </div>
);
