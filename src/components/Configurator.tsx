import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AquariumConfig, AquariumType, ExperienceLevel, InteriorStyle, SelectedFish, AQUARIUM_TYPES } from '@/types/aquarium';
import { ConfiguratorStep1 } from './ConfiguratorStep1';
import { ConfiguratorStep2 } from './ConfiguratorStep2';
import { ConfiguratorStep3 } from './ConfiguratorStep3';
import { AquariumPreview } from './AquariumPreview';
import { CompatibilityPanel } from './CompatibilityPanel';

export const Configurator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<AquariumConfig>({
    type: 'freshwater',
    volume: 300,
    experienceLevel: 'beginner',
    interiorStyle: 'minimalism',
    selectedFish: [],
    backgroundVideo: '/video-2.mp4', // Видео по умолчанию
  });

  const updateConfig = useCallback((updates: Partial<AquariumConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const addFish = useCallback((fish: SelectedFish) => {
    setConfig(prev => {
      const existing = prev.selectedFish.find(f => f.fish.id === fish.fish.id);
      if (existing) {
        return {
          ...prev,
          selectedFish: prev.selectedFish.map(f =>
            f.fish.id === fish.fish.id ? { ...f, count: f.count + fish.count } : f
          ),
        };
      }
      return { ...prev, selectedFish: [...prev.selectedFish, fish] };
    });
  }, []);

  const removeFish = useCallback((fishId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedFish: prev.selectedFish.filter(f => f.fish.id !== fishId),
    }));
  }, []);

  const updateFishCount = useCallback((fishId: string, count: number) => {
    if (count <= 0) {
      removeFish(fishId);
      return;
    }
    setConfig(prev => ({
      ...prev,
      selectedFish: prev.selectedFish.map(f =>
        f.fish.id === fishId ? { ...f, count } : f
      ),
    }));
  }, [removeFish]);

  const steps = [
    { number: 1, title: 'Параметры' },
    { number: 2, title: 'Обитатели' },
    { number: 3, title: 'Проект' },
  ];

  return (
    <section id="configurator" className="py-24 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(175_85%_50%_/_0.05)_0%,transparent_70%)]" />
      
      <div className="container px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Конфигуратор </span>
            <span className="text-gradient">аквариума</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Соберите идеальный аквариум за несколько минут
          </p>
        </motion.div>

        {/* Type tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {AQUARIUM_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => updateConfig({ type: type.id, selectedFish: [] })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                config.type === type.id
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* Main configurator grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 space-y-6">
              <AquariumPreview config={config} />

              {/* Всегда показываем блок «Ваш аквариум» под «Общий» */}
              <CompatibilityPanel
                config={config}
                onUpdateCount={updateFishCount}
                onRemove={removeFish}
              />
            </div>
          </div>

          {/* Right: Steps */}
          <div className="lg:col-span-7">
            {/* Step indicators */}
            <div className="flex items-center justify-center mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.number)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      currentStep === step.number
                        ? 'bg-primary text-primary-foreground'
                        : currentStep > step.number
                        ? 'bg-success/20 text-success'
                        : 'bg-card/50 text-muted-foreground'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm font-bold">
                      {currentStep > step.number ? '✓' : step.number}
                    </span>
                    <span className="hidden sm:inline font-medium">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`w-8 md:w-16 h-px mx-2 ${currentStep > step.number ? 'bg-success' : 'bg-border'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="glass-card p-6 md:p-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ConfiguratorStep1
                      config={config}
                      onUpdate={updateConfig}
                      onNext={() => setCurrentStep(2)}
                    />
                  </motion.div>
                )}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ConfiguratorStep2
                      config={config}
                      onAddFish={addFish}
                      onBack={() => setCurrentStep(1)}
                      onNext={() => setCurrentStep(3)}
                    />
                  </motion.div>
                )}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ConfiguratorStep3
                      config={config}
                      onBack={() => setCurrentStep(2)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
