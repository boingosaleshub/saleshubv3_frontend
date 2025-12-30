"use client";

import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  BenefitsSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
