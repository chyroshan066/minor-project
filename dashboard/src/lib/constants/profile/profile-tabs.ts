import { IconTab } from "@/types/tabs";
import {
  faCube,
  faFileLines,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";

export const PROFILE_TABS: IconTab[] = [
  {
    label: "App",
    icon: faCube,
    value: "app",
  },
  {
    label: "Messages",
    icon: faFileLines,
    value: "messages",
  },
  {
    label: "Settings",
    icon: faWrench,
    value: "settings",
  },
];
