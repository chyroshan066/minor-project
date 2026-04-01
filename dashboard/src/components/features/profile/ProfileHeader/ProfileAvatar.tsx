"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { apiClient } from "@/lib/api/axios";
import { uploadProfileImage } from "@/lib/api/uploads";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/store/authStore"; 

export const ProfileAvatar = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // 2. Destructure the updateUser action from the store
  const { updateUser } = useAuthStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await apiClient.get("/users/me");
      setUser(res.data.user);
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please upload an image file.");
    }

    try {
      setUploading(true);
      
      // Step 1: Upload to Cloudinary/Local storage
      const { url } = await uploadProfileImage(file);

      // Step 2: Update the User table in the database
      const updateRes = await apiClient.patch("/users/me", {
        avatar_url: url,
      });

      const updatedUser = updateRes.data.user;
      
      // Update local state (for the name/role text right next to the avatar)
      setUser(updatedUser); 

      updateUser({ avatar_url: updatedUser.avatar_url });

      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to update profile image.");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex-none w-auto max-w-full px-3 animate-pulse">
        <div className="h-18.5 w-18.5 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex-none w-auto max-w-full px-3">
        <div 
          onClick={handleAvatarClick}
          className="group text-base ease-soft-in-out h-18.5 w-18.5 relative inline-flex items-center justify-center rounded-xl text-surface transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <Image
            src={user?.avatar_url || "/images/random/bruce-mars.jpg"}
            width={74}
            height={74}
            alt="profile_image"
            className={`w-full h-full shadow-soft-sm rounded-xl object-cover transition-opacity ${
              uploading ? "opacity-30" : "group-hover:opacity-70"
            }`}
          />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? (
               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-main"></div>
            ) : (
              <FontAwesomeIcon icon={faCamera} className="text-white text-lg" />
            )}
          </div>
        </div>
      </div>

      <div className="flex-none w-auto max-w-full px-3 my-auto">
        <div className="h-full">
          <h5 className="mb-1">{user?.name || "User Name"}</h5>
          <p className="mb-0 font-semibold leading-normal text-sm capitalize">
            {user?.role || "Staff Member"}
          </p>
        </div>
      </div>
    </>
  );
};