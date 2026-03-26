import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CloseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const CloseButton = ({
  type = "button",
  ...props
}: CloseButtonProps) => (
  <button
    type={type}
    className="inline-block p-0 mb-4 font-bold text-center uppercase align-middle transition-all bg-transparent border-0 rounded-lg shadow-none cursor-pointer hover:scale-102 leading-pro text-xs ease-soft-in tracking-tight-soft bg-150 bg-x-25 active:opacity-85 text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-hover focus-visible:ring-offset-2"
    {...props}
  >
    <FontAwesomeIcon icon={faClose} />
  </button>
);
