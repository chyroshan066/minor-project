import { SocialLink } from "@/types";
import {
  faFacebook,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

export const PROFILE_SOCIAL_LINKS: SocialLink[] = [
  {
    id: 1,
    icon: faFacebook,
    color: "blue-800",
  },
  {
    id: 2,
    icon: faTwitter,
    color: "sky-600",
  },
  {
    id: 3,
    icon: faInstagram,
    color: "sky-900",
  },
];
