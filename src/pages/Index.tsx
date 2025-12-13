import { useState } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { Configurator } from '@/components/Configurator';
import { AboutSection } from '@/components/AboutSection';
import { GamificationSection } from '@/components/GamificationSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <HeroSection onOpenConfigurator={() => setIsConfiguratorOpen(true)} />
      <HowItWorksSection onOpenConfigurator={() => setIsConfiguratorOpen(true)} />
      <Configurator isOpen={isConfiguratorOpen} onClose={() => setIsConfiguratorOpen(false)} />
      <AboutSection />
      <GamificationSection />
      <Footer />
    </div>
  );
};

export default Index;
