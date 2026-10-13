import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';
import { SolutionSection } from './components/SolutionSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { FeaturesSection } from './components/FeaturesSection';
import { UseCasesSection } from './components/UseCasesSection';
import { ImpactSection } from './components/ImpactSection';
import { SafetySection } from './components/SafetySection';
import { FinalCTASection } from './components/FinalCTASection';

/**
 * Public landing page for the MedShare concept.
 * Presentation-only: no API calls, no inventory data, no authentication logic.
 * Sections are anchored so the site navigation can scroll directly to them.
 */
export function LandingPage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col bg-surface-background">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <UseCasesSection />
      <ImpactSection />
      <SafetySection />
      <FinalCTASection />
    </main>
  );
}
