import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AquariumConfig, AquariumType, ExperienceLevel, InteriorStyle, SelectedFish, AQUARIUM_TYPES } from '@/types/aquarium';
import { ConfiguratorStep1 } from './ConfiguratorStep1';
import { ConfiguratorStep2 } from './ConfiguratorStep2';
import { ConfiguratorStep3 } from './ConfiguratorStep3';
import { AquariumPreview } from './AquariumPreview';
import { CompatibilityPanel } from './CompatibilityPanel';
import { X } from 'lucide-react';

interface ConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Configurator = ({ isOpen, onClose }: ConfiguratorProps) => {
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[95vw] h-[95vh] max-h-[95vh] glass-card rounded-3xl overflow-hidden flex flex-col relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors z-20 border border-border/50"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border/50 flex-shrink-0">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="text-foreground">Конфигуратор </span>
              <span className="text-gradient">аквариума</span>
            </h2>
            
            {/* Type tabs */}
            <div className="flex flex-wrap gap-2 mt-4">
              {AQUARIUM_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => updateConfig({ type: type.id, selectedFish: [] })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                    config.type === type.id
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content - scrollable */}
          <div className="flex-1 overflow-hidden flex">
            {/* Main configurator grid - compact */}
            <div className="flex-1 grid lg:grid-cols-12 gap-4 p-4 overflow-y-auto">
              {/* Left: Preview - compact */}
              <div className="lg:col-span-4 space-y-3">
                <AquariumPreview config={config} />
                <CompatibilityPanel
                  config={config}
                  onUpdateCount={updateFishCount}
                  onRemove={removeFish}
                />
              </div>

              {/* Right: Steps */}
              <div className="lg:col-span-8">
                {/* Step indicators - compact */}
                <div className="flex items-center justify-center mb-4">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                      <button
                        onClick={() => setCurrentStep(step.number)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 text-xs ${
                          currentStep === step.number
                            ? 'bg-primary text-primary-foreground'
                            : currentStep > step.number
                            ? 'bg-success/20 text-success'
                            : 'bg-card/50 text-muted-foreground'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">
                          {currentStep > step.number ? '✓' : step.number}
                        </span>
                        <span className="font-medium">{step.title}</span>
                      </button>
                      {index < steps.length - 1 && (
                        <div className={`w-6 md:w-12 h-px mx-1 ${currentStep > step.number ? 'bg-success' : 'bg-border'}`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step content - compact */}
                <div className="glass-card p-4 max-h-[calc(95vh-280px)] overflow-y-auto">
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
