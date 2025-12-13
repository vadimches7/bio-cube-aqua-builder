import { useState } from 'react';
import { motion } from 'framer-motion';
import { Fish, AquariumConfig } from '@/types/aquarium';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus, AlertTriangle, Info, Droplets, Users, Ruler, Fish as FishIcon, Sparkles } from 'lucide-react';
import { WaterParamsVisualization } from './WaterParamsVisualization';
import { formatWaterParams } from '@/utils/waterParamsChecker';
import { getTagDescription } from '@/utils/compatibilityMatrix';

interface FishModalProps {
  fish: Fish;
  config: AquariumConfig;
  onClose: () => void;
  onAdd: (fish: Fish, count: number) => void;
}

export const FishModal = ({ fish, config, onClose, onAdd }: FishModalProps) => {
  const [count, setCount] = useState(fish.schooling ? (fish.minSchoolSize || 6) : 1);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Генерируем варианты путей к изображению
  const getImageVariants = (): string[] => {
    const variants: string[] = [fish.image]; // Начинаем с основного пути
    
    // Если основной путь уже содержит /fish/, пробуем альтернативы
    if (fish.image.includes('/fish/')) {
      // Специальные маппинги для известных рыб
      const knownMappings: Record<string, string> = {
        'неон': 'neon-tetra',
        'неон голубой': 'neon-tetra',
        'paracheirodon innesi': 'neon-tetra',
        'гуппи': 'guppy',
        'poecilia reticulata': 'guppy',
      };
      
      const nameKey = fish.name.toLowerCase();
      if (knownMappings[nameKey] || knownMappings[fish.nameEn.toLowerCase()]) {
        const mappedName = knownMappings[nameKey] || knownMappings[fish.nameEn.toLowerCase()];
        variants.push(`/fish/${mappedName}.jpg`);
        variants.push(`/fish/${mappedName}.png`);
      }
      
      // Варианты: оригинальное имя рыбы (для файлов типа "Акара красногрудая.jpg")
      variants.push(`/fish/${fish.name}.jpg`);
      variants.push(`/fish/${fish.name}.png`);
      
      // Вариант: латинское имя (первое слово)
      const latinFirstWord = fish.nameEn.toLowerCase().split(' ')[0];
      variants.push(`/fish/${latinFirstWord}.jpg`);
      variants.push(`/fish/${latinFirstWord}.png`);
      
      // Вариант: id рыбы
      variants.push(`/fish/${fish.id}.jpg`);
      variants.push(`/fish/${fish.id}.png`);
    }
    
    return variants;
  };
  
  const imageVariants = getImageVariants();
  const currentImageSrc = imageVariants[currentImageIndex] || imageVariants[0];
  
  const handleImageError = () => {
    if (currentImageIndex < imageVariants.length - 1) {
      // Пробуем следующий вариант
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // Все варианты исчерпаны - показываем placeholder
      setImageError(true);
    }
  };

  const existingCount = config.selectedFish.find(f => f.fish.id === fish.id)?.count || 0;
  const maxAllowed = Math.min(fish.maxCount - existingCount, Math.floor(config.volume / fish.minVolume));

  // Check for incompatibilities
  const incompatibleFish = config.selectedFish.filter(sf => 
    fish.incompatibleWith.includes(sf.fish.id) || sf.fish.incompatibleWith.includes(fish.id)
  );

  const canAdd = count > 0 && count <= maxAllowed && config.volume >= fish.minVolume;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-lg p-6 max-h-[95vh] relative flex flex-col"
      >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/50 flex items-center justify-center hover:bg-card transition-colors z-10"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {/* Fish image */}
          <div className="aspect-video rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center relative">
            {!imageError ? (
              <img
                key={currentImageIndex}
                src={currentImageSrc}
                alt={fish.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-32 h-32 opacity-40"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M50 20C35 20 25 30 25 45C25 50 27 54 30 57C28 60 27 63 27 66C27 75 35 82 45 82C47 82 49 81 51 80C53 81 55 82 57 82C67 82 75 75 75 66C75 63 74 60 72 57C75 54 77 50 77 45C77 30 67 20 52 20C51 20 50 20 50 20Z"
                    fill="currentColor"
                    className="text-primary"
                  />
                  <circle cx="42" cy="45" r="3" fill="white" />
                  <path
                    d="M30 60L25 65L30 70"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Fish info */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-1">{fish.name}</h3>
            <p className="text-muted-foreground">{fish.nameEn}</p>
          </div>

          {/* Description */}
          <p className="text-foreground/80 mb-6">{fish.description}</p>

          {/* Fun facts */}
          {fish.funFacts && fish.funFacts.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Уникальные факты</h4>
              </div>
              <ul className="space-y-2 text-sm text-foreground/80 list-disc list-inside">
                {fish.funFacts.map((fact, idx) => (
                  <li key={idx}>{fact}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-xl bg-card/50">
              <div className="text-xs text-muted-foreground mb-1">Минимальный объём</div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">{fish.minVolume}L</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-card/50">
              <div className="text-xs text-muted-foreground mb-1">Уровень ухода</div>
              <span className="font-semibold text-foreground">{fish.careLevel}</span>
            </div>
            {fish.sizeCm && (
              <div className="p-3 rounded-xl bg-card/50">
                <div className="text-xs text-muted-foreground mb-1">Размер</div>
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">до {fish.sizeCm} см</span>
                </div>
              </div>
            )}
            {fish.familyGroup && (
              <div className="p-3 rounded-xl bg-card/50">
                <div className="text-xs text-muted-foreground mb-1">Семейство</div>
                <div className="flex items-center gap-2">
                  <FishIcon className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground text-sm">{fish.familyGroup}</span>
                </div>
              </div>
            )}
            {fish.schooling && (
              <div className="p-3 rounded-xl bg-card/50 col-span-2">
                <div className="flex items-center gap-2 text-accent">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Стайная рыба — минимум {fish.minSchoolSize} особей</span>
                </div>
              </div>
            )}
          </div>

          {/* Water Parameters */}
          {fish.waterParams && (
            <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" />
                Параметры воды
              </h4>
              <WaterParamsVisualization params={fish.waterParams} />
              <div className="mt-3 text-xs text-muted-foreground">
                {formatWaterParams(fish.waterParams)}
              </div>
            </div>
          )}

          {/* Incompatible Tags */}
          {fish.incompatibleTags && fish.incompatibleTags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-2">Особенности</h4>
              <div className="flex flex-wrap gap-2">
                {fish.incompatibleTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-lg bg-card/50 text-xs text-muted-foreground border border-border/50"
                  >
                    {getTagDescription(tag)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {incompatibleFish.length > 0 && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive mb-1">Конфликт совместимости!</p>
                  <p className="text-sm text-destructive/80">
                    Несовместимо с: {incompatibleFish.map(f => f.fish.name).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {config.volume < fish.minVolume && (
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-warning mb-1">Недостаточный объём</p>
                  <p className="text-sm text-warning/80">
                    Требуется минимум {fish.minVolume}L, у вас {config.volume}L
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Count selector */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 mb-6">
            <span className="text-foreground font-medium">Количество</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCount(Math.max(fish.schooling ? (fish.minSchoolSize || 1) : 1, count - 1))}
                className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-primary/50 transition-colors"
                disabled={count <= (fish.schooling ? (fish.minSchoolSize || 1) : 1)}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-2xl font-bold text-gradient w-12 text-center">{count}</span>
              <button
                onClick={() => setCount(Math.min(maxAllowed, count + 1))}
                className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-primary/50 transition-colors"
                disabled={count >= maxAllowed}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          </div>

          {/* Actions - Fixed at bottom (outside scrollable area) */}
          <div className="flex gap-3 pt-4 mt-auto border-t border-border/50 flex-shrink-0">
            <Button variant="glass" className="flex-1" onClick={onClose}>
              Отмена
            </Button>
            <Button 
              variant="premium" 
              className="flex-1" 
              onClick={() => onAdd(fish, count)}
              disabled={!canAdd || incompatibleFish.length > 0}
            >
              Добавить
            </Button>
          </div>
      </motion.div>
    </div>
  );
};
