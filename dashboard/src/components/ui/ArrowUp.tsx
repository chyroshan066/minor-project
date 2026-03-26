import { Time } from "@/types";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ArrowUpProps extends Time {
  percentage: string;
}

export const ArrowUp = ({ percentage, time }: ArrowUpProps) => (
  <p className="text-sm leading-normal">
    <FontAwesomeIcon icon={faArrowUp} className="text-success" />
    <span className="font-semibold">{percentage}</span> {time}
  </p>
);
