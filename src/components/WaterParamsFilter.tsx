import { useState } from 'react';
import { Droplets, Thermometer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaterParamsFilterProps {
  phMin?: number;
  phMax?: number;
  tempMin?: number;
  tempMax?: number;
  onPhChange: (phMin: number | undefined, phMax: number | undefined) => void;
  onTempChange: (tempMin: number | undefined, tempMax: number | undefined) => void;
  onReset: () => void;
}

export const WaterParamsFilter = ({
  phMin,
  phMax,
  tempMin,
  tempMax,
  onPhChange,
  onTempChange,
  onReset,
}: WaterParamsFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localPhMin, setLocalPhMin] = useState(phMin?.toString() || '');
  const [localPhMax, setLocalPhMax] = useState(phMax?.toString() || '');
  const [localTempMin, setLocalTempMin] = useState(tempMin?.toString() || '');
  const [localTempMax, setLocalTempMax] = useState(tempMax?.toString() || '');

  const hasActiveFilters = phMin !== undefined || phMax !== undefined || tempMin !== undefined || tempMax !== undefined;

  const handlePhApply = () => {
    const min = localPhMin ? parseFloat(localPhMin) : undefined;
    const max = localPhMax ? parseFloat(localPhMax) : undefined;
    onPhChange(min, max);
  };

  const handleTempApply = () => {
    const min = localTempMin ? parseFloat(localTempMin) : undefined;
    const max = localTempMax ? parseFloat(localTempMax) : undefined;
    onTempChange(min, max);
  };

  const handleReset = () => {
    setLocalPhMin('');
    setLocalPhMax('');
    setLocalTempMin('');
    setLocalTempMax('');
    onReset();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          hasActiveFilters
            ? 'bg-primary text-primary-foreground'
            : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
        }`}
      >
        <Droplets className="w-4 h-4" />
        Параметры воды
        {hasActiveFilters && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-foreground/20 text-xs">
            {[phMin, phMax, tempMin, tempMax].filter(v => v !== undefined).length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 z-50 w-80 p-4 rounded-xl glass-card border border-border/50 shadow-lg"
          >
            <div className="space-y-4">
              {/* pH Filter */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">pH</span>
                  {(phMin !== undefined || phMax !== undefined) && (
                    <button
                      onClick={() => {
                        setLocalPhMin('');
                        setLocalPhMax('');
                        onPhChange(undefined, undefined);
                      }}
                      className="ml-auto w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center hover:bg-destructive/30"
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="4"
                    max="9"
                    placeholder="От"
                    value={localPhMin}
                    onChange={(e) => setLocalPhMin(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-card/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="4"
                    max="9"
                    placeholder="До"
                    value={localPhMax}
                    onChange={(e) => setLocalPhMax(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-card/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={handlePhApply}
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Применить
                  </button>
                </div>
                {(phMin !== undefined || phMax !== undefined) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Активен: pH {phMin !== undefined ? phMin.toFixed(1) : '?'} - {phMax !== undefined ? phMax.toFixed(1) : '?'}
                  </div>
                )}
              </div>

              {/* Temperature Filter */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Температура</span>
                  {(tempMin !== undefined || tempMax !== undefined) && (
                    <button
                      onClick={() => {
                        setLocalTempMin('');
                        setLocalTempMax('');
                        onTempChange(undefined, undefined);
                      }}
                      className="ml-auto w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center hover:bg-destructive/30"
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="1"
                    min="10"
                    max="35"
                    placeholder="От, °C"
                    value={localTempMin}
                    onChange={(e) => setLocalTempMin(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-card/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                  />
                  <input
                    type="number"
                    step="1"
                    min="10"
                    max="35"
                    placeholder="До, °C"
                    value={localTempMax}
                    onChange={(e) => setLocalTempMax(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-card/50 border border-border/50 text-foreground text-sm focus:outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={handleTempApply}
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Применить
                  </button>
                </div>
                {(tempMin !== undefined || tempMax !== undefined) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Активен: {tempMin !== undefined ? tempMin : '?'} - {tempMax !== undefined ? tempMax : '?'}°C
                  </div>
                )}
              </div>

              {/* Reset button */}
              {hasActiveFilters && (
                <button
                  onClick={handleReset}
                  className="w-full px-3 py-2 rounded-lg bg-card/50 text-muted-foreground text-sm font-medium hover:bg-card hover:text-foreground border border-border/50 transition-colors"
                >
                  Сбросить все фильтры
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};
