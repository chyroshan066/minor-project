"use client";

import { useState, useRef, useEffect } from "react";
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore"; // Adjust this path to your store
import { IsProfile } from "@/types";

export const SignInLink = ({ isProfile }: IsProfile) => {
  const { user, clearSession: logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. If not logged in, show the standard Sign In link
  if (!user) {
    return (
      <li className="flex items-center">
        <Link
          href="/login"
          className={`block px-1 py-2 text-sm font-semibold transition-all rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:ring-offset-2 ${
            isProfile
              ? "text-surface ease-soft-in-out"
              : "text-muted ease-nav-brand"
          }`}
        >
          <FontAwesomeIcon icon={faUser} className="sm:mr-1" />
          <span className="hidden sm:inline">Sign In</span>
        </Link>
      </li>
    );
  }

  // 2. If logged in, show the Profile Icon + Logout Dropdown
  return (
    <li className="relative flex items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-1 py-2 text-sm font-semibold transition-all rounded-lg outline-none focus:ring-2 focus:ring-cyan-500/20"
      >
        {user.avatar_url ? (
          <div className="relative w-8 h-8 overflow-hidden rounded-xl shadow-soft-sm border border-border/50">
            <Image 
              src={user.avatar_url} 
              alt="Profile" 
              fill 
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-soft-blue600-cyan400 text-surface shadow-soft-sm">
            <FontAwesomeIcon icon={faUser} className="text-[10px]" />
          </div>
        )}
        <span className={`hidden md:inline ${isProfile ? "text-surface" : "text-dark"}`}>
          {user.name.split(' ')[0]}
        </span>
      </button>

      {/* Logout Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 origin-top-right rounded-xl bg-surface p-2 shadow-soft-3xl border border-border z-50 animate-soft-in">
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs font-semibold text-danger hover:bg-slate-50 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </button>
        </div>
      )}
    </li>
  );
};