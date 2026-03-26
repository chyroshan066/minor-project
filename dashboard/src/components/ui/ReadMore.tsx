import { FocusRingColor, TextColor } from "@/types";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

interface ReadMoreProps extends TextColor, FocusRingColor {}

export const ReadMore = ({
  textColor = "text-muted",
  focusRingColor,
}: ReadMoreProps) => {
  const ringClass =
    focusRingColor ||
    (textColor === "text-surface"
      ? "focus-visible:ring-surface/60"
      : "focus-visible:ring-border-hover");

  return (
    <Link
      className={`mt-auto mb-0 text-sm font-semibold leading-normal group ${textColor} outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${ringClass}
        rounded-md px-1 -mx-1 transition-all`}
      href="#"
    >
      View Analytics 
      <FontAwesomeIcon
        icon={faArrowRight}
        className="ease-bounce text-sm group-hover:translate-x-1.25 ml-1 leading-normal transition-all duration-200"
      />
    </Link>
  );
};
