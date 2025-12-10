import { AquariumConfig, EXPERIENCE_LEVELS, INTERIOR_STYLES } from '@/types/aquarium';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowRight } from 'lucide-react';

interface ConfiguratorStep1Props {
  config: AquariumConfig;
  onUpdate: (updates: Partial<AquariumConfig>) => void;
  onNext: () => void;
}

export const ConfiguratorStep1 = ({ config, onUpdate, onNext }: ConfiguratorStep1Props) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">Параметры аквариума</h3>
        <p className="text-muted-foreground">Укажите базовые характеристики вашего будущего аквариума</p>
      </div>

      {/* Volume slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Объём аквариума</label>
          <span className="text-2xl font-bold text-gradient">{config.volume}L</span>
        </div>
        <Slider
          value={[config.volume]}
          onValueChange={([value]) => onUpdate({ volume: value })}
          min={40}
          max={500}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>40L</span>
          <span>Рекомендовано: 100-200L</span>
          <span>500L</span>
        </div>
      </div>

      {/* Experience level */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">Ваш уровень опыта</label>
        <div className="grid grid-cols-3 gap-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => onUpdate({ experienceLevel: level.id })}
              className={`p-4 rounded-xl text-center transition-all duration-300 ${
                config.experienceLevel === level.id
                  ? 'bg-primary/20 border-2 border-primary text-foreground'
                  : 'bg-card/50 border border-border/50 text-muted-foreground hover:bg-card hover:text-foreground'
              }`}
            >
              <span className="text-sm font-medium">{level.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interior style */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">Стиль интерьера</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {INTERIOR_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onUpdate({ interiorStyle: style.id })}
              className={`p-4 rounded-xl text-center transition-all duration-300 ${
                config.interiorStyle === style.id
                  ? 'bg-primary/20 border-2 border-primary text-foreground'
                  : 'bg-card/50 border border-border/50 text-muted-foreground hover:bg-card hover:text-foreground'
              }`}
            >
              <span className="text-sm font-medium">{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Next button */}
      <div className="flex justify-end pt-4">
        <Button variant="premium" size="lg" onClick={onNext}>
          Выбрать обитателей
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
