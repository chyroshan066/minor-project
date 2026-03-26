import { Setting } from "@/types";

export const ACCOUNT_SETTINGS: Setting[] = [
  {
    id: "follow",
    label: "Email me when someone follows me",
    defaultChecked: true,
  },
  {
    id: "answer",
    label: "Email me when someone answers on my post",
    defaultChecked: false,
  },
  {
    id: "mention",
    label: "Email me when someone mentions me",
    defaultChecked: true,
  },
];

export const APPLICATION_SETTINGS: Setting[] = [
  {
    id: "launches projects",
    label: "New launches and projects",
    defaultChecked: false,
  },
  {
    id: "product updates",
    label: "Monthly product updates",
    defaultChecked: true,
  },
  {
    id: "subscribe",
    label: "Subscribe to newsletter",
    defaultChecked: true,
  },
];
