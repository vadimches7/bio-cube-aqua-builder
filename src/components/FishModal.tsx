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
    <div className="glass-card p-3 h-full max-h-[calc(95vh-200px)] relative flex flex-col border border-border/50 rounded-xl overflow-hidden">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors z-10 border border-border/50"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {/* Horizontal layout: Image left, Info right */}
      <div className="flex-1 flex gap-3 overflow-hidden">
        {/* Left: Fish image */}
        <div className="flex-shrink-0 w-2/5">
          <div className="rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center relative h-full min-h-[200px]">
            {!imageError ? (
              <img
                key={currentImageIndex}
                src={currentImageSrc}
                alt={fish.name}
                className="w-full h-full object-contain"
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-24 h-24 opacity-40"
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
        </div>

        {/* Right: Scrollable info */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto pr-1 -mr-1">
            {/* Fish info - compact */}
            <div className="mb-3">
              <h3 className="text-base font-bold text-foreground mb-0.5">{fish.name}</h3>
              <p className="text-xs text-muted-foreground">{fish.nameEn}</p>
            </div>

            {/* Description - compact */}
            <p className="text-xs text-foreground/80 mb-3 line-clamp-3">{fish.description}</p>

                {/* Fun facts - compact */}
            {fish.funFacts && fish.funFacts.length > 0 && (
              <div className="mb-3 p-2 rounded-lg bg-card/50 border border-border/50">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <h4 className="text-xs font-semibold text-foreground">Факты</h4>
                </div>
                <ul className="space-y-1 text-xs text-foreground/80 list-disc list-inside">
                  {fish.funFacts.slice(0, 2).map((fact, idx) => (
                    <li key={idx} className="line-clamp-1">{fact}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stats - compact */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2 rounded-lg bg-card/50">
                <div className="text-[10px] text-muted-foreground mb-0.5">Объём</div>
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{fish.minVolume}L</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-card/50">
                <div className="text-[10px] text-muted-foreground mb-0.5">Уход</div>
                <span className="text-xs font-semibold text-foreground">{fish.careLevel}</span>
              </div>
              {fish.sizeCm && (
                <div className="p-2 rounded-lg bg-card/50">
                  <div className="text-[10px] text-muted-foreground mb-0.5">Размер</div>
                  <div className="flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-foreground">до {fish.sizeCm} см</span>
                  </div>
                </div>
              )}
              {fish.familyGroup && (
                <div className="p-2 rounded-lg bg-card/50">
                  <div className="text-[10px] text-muted-foreground mb-0.5">Семейство</div>
                  <div className="flex items-center gap-1">
                    <FishIcon className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-foreground">{fish.familyGroup}</span>
                  </div>
                </div>
              )}
              {fish.schooling && (
                <div className="p-2 rounded-lg bg-card/50 col-span-2">
                  <div className="flex items-center gap-1.5 text-accent">
                    <Users className="w-3 h-3" />
                    <span className="text-xs">Стайная — мин. {fish.minSchoolSize} особей</span>
                  </div>
                </div>
              )}
            </div>

            {/* Water Parameters - compact */}
            {fish.waterParams && (
              <div className="mb-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Droplets className="w-3 h-3 text-primary" />
                  Параметры воды
                </h4>
                <WaterParamsVisualization params={fish.waterParams} />
                <div className="mt-2 text-[10px] text-muted-foreground">
                  {formatWaterParams(fish.waterParams)}
                </div>
              </div>
            )}

            {/* Incompatible Tags - compact */}
            {fish.incompatibleTags && fish.incompatibleTags.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-foreground mb-1.5">Особенности</h4>
                <div className="flex flex-wrap gap-1">
                  {fish.incompatibleTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-card/50 text-[10px] text-muted-foreground border border-border/50"
                    >
                      {getTagDescription(tag)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings - compact */}
            {incompatibleFish.length > 0 && (
              <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 mb-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-0.5">Конфликт!</p>
                    <p className="text-[10px] text-destructive/80">
                      Несовместимо с: {incompatibleFish.map(f => f.fish.name).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {config.volume < fish.minVolume && (
              <div className="p-2 rounded-lg bg-warning/10 border border-warning/30 mb-3">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-warning mb-0.5">Мало объёма</p>
                    <p className="text-[10px] text-warning/80">
                      Нужно {fish.minVolume}L, у вас {config.volume}L
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Count selector - compact */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-card/50 mb-3">
              <span className="text-xs text-foreground font-medium">Количество</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCount(Math.max(fish.schooling ? (fish.minSchoolSize || 1) : 1, count - 1))}
                  className="w-7 h-7 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-primary/50 transition-colors"
                  disabled={count <= (fish.schooling ? (fish.minSchoolSize || 1) : 1)}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-lg font-bold text-gradient w-8 text-center">{count}</span>
                <button
                  onClick={() => setCount(Math.min(maxAllowed, count + 1))}
                  className="w-7 h-7 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-primary/50 transition-colors"
                  disabled={count >= maxAllowed}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex gap-2 pt-2 border-t border-border/50 flex-shrink-0">
            <Button variant="glass" size="sm" className="flex-1" onClick={onClose}>
              Отмена
            </Button>
            <Button 
              variant="premium" 
              size="sm"
              className="flex-1" 
              onClick={() => onAdd(fish, count)}
              disabled={!canAdd || incompatibleFish.length > 0}
            >
              Добавить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
