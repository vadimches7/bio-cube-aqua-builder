import { HeroSection } from '@/components/HeroSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { Configurator } from '@/components/Configurator';
import { AboutSection } from '@/components/AboutSection';
import { GamificationSection } from '@/components/GamificationSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <Configurator />
      <AboutSection />
      <GamificationSection />
      <Footer />
    </div>
  );
};

export default Index;
