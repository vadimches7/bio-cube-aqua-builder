import { WaterParams } from '@/types/aquarium';
import { Droplets, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

interface WaterParamsVisualizationProps {
  params: WaterParams;
  className?: string;
}

export const WaterParamsVisualization = ({ params, className = '' }: WaterParamsVisualizationProps) => {
  if (!params || (!params.phMin && !params.tempMin)) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* pH Visualization */}
      {params.phMin !== undefined && params.phMax !== undefined && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">pH</span>
            <span className="text-xs text-muted-foreground">
              {params.phMin.toFixed(1)} - {params.phMax.toFixed(1)}
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-card overflow-hidden">
            {/* pH scale background (6.0 to 8.0) */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-blue-500/20" style={{ width: '20%' }} /> {/* 6.0-6.5 кислая */}
              <div className="flex-1 bg-green-500/20" style={{ width: '30%' }} /> {/* 6.5-7.5 нейтральная */}
              <div className="flex-1 bg-yellow-500/20" style={{ width: '30%' }} /> {/* 7.5-8.0 щелочная */}
              <div className="flex-1 bg-orange-500/20" style={{ width: '20%' }} /> {/* 8.0+ очень щелочная */}
            </div>
            {/* pH range indicator */}
            <motion.div
              className="absolute h-full bg-primary/60 border border-primary"
              initial={{ width: 0 }}
              animate={{
                width: `${((params.phMax - params.phMin) / 2) * 100}%`,
                left: `${((params.phMin - 6.0) / 2) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
            {/* pH value markers */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary"
              style={{ left: `${((params.phMin - 6.0) / 2) * 100}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary"
              style={{ left: `${((params.phMax - 6.0) / 2) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>6.0</span>
            <span>7.0</span>
            <span>8.0</span>
          </div>
        </div>
      )}

      {/* Temperature Visualization */}
      {params.tempMin !== undefined && params.tempMax !== undefined && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Температура</span>
            <span className="text-xs text-muted-foreground">
              {params.tempMin} - {params.tempMax}°C
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-card overflow-hidden">
            {/* Temperature scale background (18 to 30°C) */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-blue-500/20" style={{ width: '16.67%' }} /> {/* 18-20 холодная */}
              <div className="flex-1 bg-cyan-500/20" style={{ width: '16.67%' }} /> {/* 20-22 прохладная */}
              <div className="flex-1 bg-green-500/20" style={{ width: '33.33%' }} /> {/* 22-26 оптимальная */}
              <div className="flex-1 bg-yellow-500/20" style={{ width: '16.67%' }} /> {/* 26-28 теплая */}
              <div className="flex-1 bg-orange-500/20" style={{ width: '16.67%' }} /> {/* 28-30 горячая */}
            </div>
            {/* Temperature range indicator */}
            <motion.div
              className="absolute h-full bg-primary/60 border border-primary"
              initial={{ width: 0 }}
              animate={{
                width: `${((params.tempMax - params.tempMin) / 12) * 100}%`,
                left: `${((params.tempMin - 18) / 12) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
            {/* Temperature value markers */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary"
              style={{ left: `${((params.tempMin - 18) / 12) * 100}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary"
              style={{ left: `${((params.tempMax - 18) / 12) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>18°C</span>
            <span>24°C</span>
            <span>30°C</span>
          </div>
        </div>
      )}
    </div>
  );
};

