import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fish, AquariumConfig } from '@/types/aquarium';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus, AlertTriangle, Info, Droplets, Users } from 'lucide-react';

interface FishModalProps {
  fish: Fish;
  config: AquariumConfig;
  onClose: () => void;
  onAdd: (fish: Fish, count: number) => void;
}

export const FishModal = ({ fish, config, onClose, onAdd }: FishModalProps) => {
  const [count, setCount] = useState(fish.schooling ? (fish.minSchoolSize || 6) : 1);

  const existingCount = config.selectedFish.find(f => f.fish.id === fish.id)?.count || 0;
  const maxAllowed = Math.min(fish.maxCount - existingCount, Math.floor(config.volume / fish.minVolume));

  // Check for incompatibilities
  const incompatibleFish = config.selectedFish.filter(sf => 
    fish.incompatibleWith.includes(sf.fish.id) || sf.fish.incompatibleWith.includes(fish.id)
  );

  const canAdd = count > 0 && count <= maxAllowed && config.volume >= fish.minVolume;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/50 flex items-center justify-center hover:bg-card transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Fish image */}
          <div className="aspect-video rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
            <motion.div
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl"
            >
              🐠
            </motion.div>
          </div>

          {/* Fish info */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-1">{fish.name}</h3>
            <p className="text-muted-foreground">{fish.nameEn}</p>
          </div>

          {/* Description */}
          <p className="text-foreground/80 mb-6">{fish.description}</p>

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
            {fish.schooling && (
              <div className="p-3 rounded-xl bg-card/50 col-span-2">
                <div className="flex items-center gap-2 text-accent">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Стайная рыба — минимум {fish.minSchoolSize} особей</span>
                </div>
              </div>
            )}
          </div>

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

          {/* Actions */}
          <div className="flex gap-3">
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
      </motion.div>
    </AnimatePresence>
  );
};
