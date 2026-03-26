import { useLayoutConfig } from "@/hooks/useLayoutConfig";
import { IsProfile } from "@/types";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const SettingsLink = ({ isProfile }: IsProfile) => {
  const { toggleConfigurator } = useLayoutConfig();

  return (
    <li className="flex items-center px-4">
      <button
        type="button"
        onClick={toggleConfigurator}
        className={`p-0 text-sm transition-all rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary-ring/50 focus-visible:ring-offset-2 ${
          isProfile
            ? "text-surface ease-soft-in-out focus-visible:ring-offset-secondary"
            : "text-muted ease-nav-brand focus-visible:ring-offset-surface"
        }`}
      >
        <FontAwesomeIcon icon={faCog} className="cursor-pointer" />
      </button>
    </li>
  );
};
