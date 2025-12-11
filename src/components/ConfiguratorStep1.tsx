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
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">Параметры аквариума</h3>
        <p className="text-muted-foreground">Настройте объём ползунком, подберите опыт и стиль</p>
      </div>

      {/* Volume selection */}
      <div className="space-y-4 p-4 rounded-2xl border border-dashed border-border/60 bg-card/30">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Или настройте объём вручную</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Объём аквариума</label>
            <span className="text-xl font-bold text-gradient">{config.volume}L</span>
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

      {/* Interior style with images */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">Стиль интерьера</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INTERIOR_STYLES.map((style) => {
            const image = INTERIOR_STYLE_IMAGES[style.id];
            const selected = config.interiorStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => onUpdate({ interiorStyle: style.id })}
                className={`group rounded-2xl overflow-hidden border transition-all duration-300 text-left ${
                  selected
                    ? 'border-primary shadow-glow bg-primary/10'
                    : 'border-border/50 bg-card/40 hover:border-primary/40'
                }`}
              >
                <div className="relative">
                  <img src={image} alt={style.name} className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {selected && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs bg-primary text-primary-foreground shadow">
                      Выбрано
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-1">
                  <div className="text-sm font-semibold text-foreground">{style.name}</div>
                  <p className="text-xs text-muted-foreground">
                    Подходит для {style.id === 'minimalism' ? 'минималистичных' : style.id === 'loft' ? 'лофт' : style.id === 'scandi' ? 'скандинавских' : 'современных'} интерьеров
                  </p>
                </div>
              </button>
            );
          })}
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
