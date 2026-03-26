import { RegistrationFormCard } from "./RegistrationFormCard";
import { RegistrationHero } from "./RegistrationHero";

export const RegistrationSection = () => (
  <section className="min-h-screen mb-32">
    <RegistrationHero />
    <RegistrationFormCard />
  </section>
);
