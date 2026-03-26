"use client";

import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileCoverImage } from "./ProfileCoverImage";
import { ProfileTabs } from "./ProfileTabs";

export const ProfileHeader = () => (
  <div className="w-full px-6 mx-auto">
    <ProfileCoverImage />

    {/* Profile Card Section */}
    <div className="relative flex flex-col flex-auto min-w-0 p-4 mx-6 -mt-16 overflow-hidden break-words border-0 shadow-blur rounded-2xl bg-surface/80 bg-clip-border backdrop-blur-2xl backdrop-saturate-200">
      <div className="flex flex-wrap -mx-3">
        <ProfileAvatar />
        <ProfileTabs />
      </div>
    </div>
  </div>
);
