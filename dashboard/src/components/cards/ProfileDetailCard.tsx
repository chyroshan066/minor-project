"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserEdit } from "@fortawesome/free-solid-svg-icons";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Card, CardHeader } from "../ui/card";
import { Separator } from "../ui/Separator";
import { PROFILE_SOCIAL_LINKS } from "@/lib/constants";
import { apiClient } from "@/lib/api/axios";

export const ProfileDetailCard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/users/me");
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching profile details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Construct dynamic details based on fetched user data
  const dynamicDetails = [
    { id: 1, label: "Full Name", value: user?.name || "N/A" },
    { id: 2, label: "Mobile", value: user?.mobile || "(+977) 000-0000000" },
    { id: 3, label: "Email", value: user?.email || "N/A" },
    { id: 4, label: "Location", value: user?.location || "Butwal, Nepal" },
  ];

  if (loading) {
    return (
      <Card
        outerDivClassName="lg-max:mt-6 xl:w-4/12"
        innerDivClassName="h-full bg-surface shadow-soft-xl animate-pulse"
      >
        <div className="p-8 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Tooltip.Provider delayDuration={100} skipDelayDuration={500}>
      <Card
        outerDivClassName="lg-max:mt-6 xl:w-4/12"
        innerDivClassName="h-full bg-surface shadow-soft-xl"
      >
        <CardHeader paddingSize={4}>
          <div className="flex flex-wrap items-center -mx-3">
            <div className="flex items-center w-8/12 max-w-full px-3 shrink-0 md:flex-none">
              <h6 className="mb-0">Profile Information</h6>
            </div>
            <div className="w-4/12 max-w-full px-3 text-right shrink-0 md:flex-none">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    className="rounded-full focus-visible:scale-110 outline-none focus-visible:ring-2 focus-visible:ring-disabled/50 focus-visible:ring-offset-2"
                  >
                    <FontAwesomeIcon
                      icon={faUserEdit}
                      className="leading-normal text-sm text-disabled"
                    />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="z-50 px-2 py-1 text-center text-surface bg-black rounded-lg text-sm zoom-in-95"
                    sideOffset={5}
                    side="top"
                  >
                    Edit Profile
                    <Tooltip.Arrow className="fill-black" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>
          </div>
        </CardHeader>
        <div className="flex-auto p-4">
          <p className="leading-normal text-sm">
            Hi, I&apos;m {user?.name}, a dedicated {user?.role} at our facility. 
            I am committed to providing the best administrative and medical 
            support to ensure a seamless patient experience.
          </p>
          <Separator className="my-6" />
          <ul className="flex flex-col pl-0 mb-0 rounded-lg">
            {dynamicDetails.map((detail) => (
              <li
                key={detail.id}
                className="relative block px-4 py-2 first:pt-0 pl-0 leading-normal bg-surface border-0 first:rounded-t-lg not-first:border-t-0 text-sm text-inherit"
              >
                <strong className="text-main">{detail.label}:</strong> &nbsp;{" "}
                {detail.value}
              </li>
            ))}
            <li className="relative block px-4 py-2 pb-0 pl-0 bg-surface border-0 border-t-0 rounded-b-lg text-inherit">
              <strong className="leading-normal text-sm text-main">
                Social:
              </strong>
              &nbsp;
              {PROFILE_SOCIAL_LINKS.map((link) => (
                <a
                  key={link.id}
                  className={`inline-block py-0 pl-1 pr-2 mb-0 font-bold text-center text-${link.color} align-middle transition-all bg-transparent border-0 rounded-lg shadow-none cursor-pointer leading-pro text-xs ease-soft-in bg-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-disabled`}
                  href="#"
                  target="_blank"
                >
                  <FontAwesomeIcon icon={link.icon} className="fa-lg" />
                </a>
              ))}
            </li>
          </ul>
        </div>
      </Card>
    </Tooltip.Provider>
  );
};