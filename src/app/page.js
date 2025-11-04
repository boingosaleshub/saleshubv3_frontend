import Header from "@/components/Header"
import HeroSection from "@/components/HeroSection"
import FeaturesSection from "@/components/FeaturesSection"
import AboutSection from "@/components/AboutSection"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
      </main>
    </div>
  );
}