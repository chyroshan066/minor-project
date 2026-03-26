import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInbox } from "@fortawesome/free-solid-svg-icons";
import { Icon, Message } from "@/types";

interface EmptyStateProps extends Message, Icon {
  description?: string;
}

export const EmptyState = ({ 
  message, 
  icon = faInbox, 
  description 
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-transparent border-0 rounded-2xl">
    <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-slate-100 text-slate-400">
      <FontAwesomeIcon icon={icon} size="lg" />
    </div>
    <h6 className="mb-1 text-slate-700">{message}</h6>
    {description && (
      <p className="mb-0 text-sm leading-normal text-disabled">{description}</p>
    )}
  </div>
);