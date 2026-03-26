import { CloseButton } from "@/components/ui/Button";
import { useLayoutConfig } from "@/hooks/useLayoutConfig";

export const ConfiguratorPanelHeader = () => {
  const { toggleConfigurator } = useLayoutConfig();

  return (
    <div className="px-6 pt-4 pb-0 mb-0 bg-surface border-b-0 rounded-t-2xl">
      <div className="float-left">
        <h5 className="mt-4 mb-0">Soft UI Configurator</h5>
        <p>See our dashboard options.</p>
      </div>
      <div className="float-right mt-6">
        <CloseButton
          onClick={toggleConfigurator}
          aria-label="Close configurator panel"
        />
      </div>
    </div>
  );
};
