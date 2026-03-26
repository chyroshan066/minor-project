import { Checkbox } from "@/components/ui/form/Checkbox";
import { useLayoutConfig } from "@/hooks/useLayoutConfig";

export const NavbarFixedToggle = () => {
  const { fixedNavbar, setFixedNavbar } = useLayoutConfig();

  return (
    <>
      <div className="mt-4">
        <h6 className="mb-0">Navbar Fixed</h6>
      </div>
      <div className="min-h-6 mb-0.5 block pl-0">
        <Checkbox
          id="fixedNav"
          defaultChecked={fixedNavbar}
          marginTop="1"
          focusRingColor="focus-visible:ring-border-hover"
          focusRingOffsetColor="focus-visible:ring-offset-surface"
          onChange={(e) => setFixedNavbar(e.target.checked)}
        />
      </div>
    </>
  );
};
