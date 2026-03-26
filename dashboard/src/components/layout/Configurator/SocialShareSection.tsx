import { Button } from "@/components/ui/Button";
import { SOCIAL_SHARE_BUTTONS } from "@/lib/constants";

export const SocialShareSection = () => (
  <div className="w-full text-center">
    <h6 className="mt-4">Thank you for sharing!</h6>
    {SOCIAL_SHARE_BUTTONS.map((btn) => (
      <Button
        key={btn.id}
        variant="gradient"
        className="mb-0 mr-2 border-0 me-2 border-main"
        backgroundColor="bg-main"
        focusRingColor="focus-visible:ring-disabled/50"
        icon={btn.icon}
        btnText={btn.btnText}
      />
    ))}
  </div>
);
