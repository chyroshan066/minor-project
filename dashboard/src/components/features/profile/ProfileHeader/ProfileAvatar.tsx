"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { apiClient } from "@/lib/api/axios";
import { uploadProfileImage } from "@/lib/api/uploads"; // Import your new API function
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

export const ProfileAvatar = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
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
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Client-side validation
    if (!file.type.startsWith("image/")) {
      return toast.error("Please upload an image file.");
    }

    try {
      setUploading(true);
      
      // Step 1: Upload to Cloudinary/Local storage
      const { url } = await uploadProfileImage(file);

      // Step 2: Update the User table in the database
      // This hits your userController.updateMe via the PATCH /me route
      const updateRes = await apiClient.patch("/users/me", {
        avatar_url: url,
      });

      // Update local state so UI changes immediately
      setUser(updateRes.data.user);
      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to update profile image.");
    } finally {
      setUploading(false);
      // Reset input so user can pick the same file again if they want
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
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Avatar Container */}
      <div className="flex-none w-auto max-w-full px-3">
        <div 
          onClick={handleAvatarClick}
          className="group text-base ease-soft-in-out h-18.5 w-18.5 relative inline-flex items-center justify-center rounded-xl text-surface transition-all duration-200 cursor-pointer overflow-hidden"
        >
          {/* Avatar Image */}
          <Image
            src={user?.avatar_url || "/images/random/bruce-mars.jpg"}
            width={74}
            height={74}
            alt="profile_image"
            className={`w-full h-full shadow-soft-sm rounded-xl object-cover transition-opacity ${
              uploading ? "opacity-30" : "group-hover:opacity-70"
            }`}
          />
          
          {/* Hover/Loading Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? (
               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-main"></div>
            ) : (
              <FontAwesomeIcon icon={faCamera} className="text-white text-lg" />
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
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