import { AquariumConfig, EXPERIENCE_LEVELS, INTERIOR_STYLES, InteriorStyle } from '@/types/aquarium';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, Info } from 'lucide-react';

const INTERIOR_STYLE_IMAGES: Record<InteriorStyle, string> = {
  minimalism: '/bio-cube/interior-minimalism.png',
  loft: '/bio-cube/interior-loft.png',
  scandi: '/bio-cube/interior-scandi.png',
  hightech: '/bio-cube/interior-hightech.png',
};

interface ConfiguratorStep1Props {
  config: AquariumConfig;
  onUpdate: (updates: Partial<AquariumConfig>) => void;
  onNext: () => void;
}

export const ConfiguratorStep1 = ({ config, onUpdate, onNext }: ConfiguratorStep1Props) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1 text-foreground">Параметры аквариума</h3>
        <p className="text-xs text-muted-foreground">Настройте объём, опыт и стиль</p>
      </div>

      {/* Volume selection - compact */}
      <div className="space-y-2 p-3 rounded-xl border border-dashed border-border/60 bg-card/30">
        <div className="flex items-center gap-2">
          <Info className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-foreground">Настройте объём</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">Объём</label>
            <span className="text-lg font-bold text-gradient">{config.volume}L</span>
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
            <span className="text-[10px]">100-200L</span>
            <span>500L</span>
          </div>
        </div>
      </div>

      {/* Experience level - compact */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Уровень опыта</label>
        <div className="grid grid-cols-3 gap-2">
          {EXPERIENCE_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => onUpdate({ experienceLevel: level.id })}
              className={`p-2 rounded-lg text-center transition-all duration-300 text-xs ${
                config.experienceLevel === level.id
                  ? 'bg-primary/20 border-2 border-primary text-foreground'
                  : 'bg-card/50 border border-border/50 text-muted-foreground hover:bg-card hover:text-foreground'
              }`}
            >
              <span className="font-medium">{level.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interior style with images - compact */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Стиль интерьера</label>
        <div className="grid grid-cols-2 gap-2">
          {INTERIOR_STYLES.map((style) => {
            const image = INTERIOR_STYLE_IMAGES[style.id];
            const selected = config.interiorStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => onUpdate({ interiorStyle: style.id })}
                className={`group rounded-xl overflow-hidden border transition-all duration-300 text-left ${
                  selected
                    ? 'border-primary shadow-glow bg-primary/10'
                    : 'border-border/50 bg-card/40 hover:border-primary/40'
                }`}
              >
                <div className="relative">
                  <img src={image} alt={style.name} className="w-full h-20 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {selected && (
                    <span className="absolute top-1 left-1 px-2 py-0.5 rounded text-[10px] bg-primary text-primary-foreground shadow">
                      ✓
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <div className="text-xs font-semibold text-foreground">{style.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next button - compact */}
      <div className="flex justify-end pt-2">
        <Button variant="premium" size="sm" onClick={onNext}>
          Далее
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
