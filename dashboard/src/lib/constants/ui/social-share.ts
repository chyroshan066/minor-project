import { SocialShareButton } from "@/types";
import {
  faFacebookSquare,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

export const SOCIAL_SHARE_BUTTONS: SocialShareButton[] = [
  {
    id: "twitter",
    btnText: "Tweet",
    icon: faTwitter,
    href: "#", // Add your URL here
  },
  {
    id: "facebook",
    btnText: "Share",
    icon: faFacebookSquare,
    href: "#", // Add your URL here
  },
];
