import { AquariumConfig, CompatibilityStatus } from '@/types/aquarium';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Trash2, Plus, Minus } from 'lucide-react';

interface CompatibilityPanelProps {
  config: AquariumConfig;
  onUpdateCount: (fishId: string, count: number) => void;
  onRemove: (fishId: string) => void;
}

export const CompatibilityPanel = ({ config, onUpdateCount, onRemove }: CompatibilityPanelProps) => {
  // Calculate compatibility
  const totalFishVolume = config.selectedFish.reduce((acc, sf) => {
    return acc + (sf.fish.minVolume * sf.count * 0.3);
  }, 0);
  
  const volumePercentage = Math.min((totalFishVolume / config.volume) * 100, 100);

  // Check for conflicts
  const conflicts: string[] = [];
  config.selectedFish.forEach(sf1 => {
    config.selectedFish.forEach(sf2 => {
      if (sf1.fish.id !== sf2.fish.id && sf1.fish.incompatibleWith.includes(sf2.fish.id)) {
        const conflictMsg = `${sf1.fish.name} несовместима с ${sf2.fish.name}`;
        if (!conflicts.includes(conflictMsg)) {
          conflicts.push(conflictMsg);
        }
      }
    });
  });

  // Check schooling requirements
  const schoolingWarnings: string[] = [];
  config.selectedFish.forEach(sf => {
    if (sf.fish.schooling && sf.fish.minSchoolSize && sf.count < sf.fish.minSchoolSize) {
      schoolingWarnings.push(`${sf.fish.name}: рекомендуется минимум ${sf.fish.minSchoolSize} особей`);
    }
  });

  const getStatus = (): CompatibilityStatus => {
    if (conflicts.length > 0) return 'incompatible';
    if (volumePercentage > 80 || schoolingWarnings.length > 0) return 'risky';
    if (volumePercentage > 60) return 'good';
    return 'excellent';
  };

  const status = getStatus();

  const getStatusConfig = () => {
    switch (status) {
      case 'excellent':
        return { icon: CheckCircle, text: 'Отлично', color: 'text-success', bg: 'bg-success/20' };
      case 'good':
        return { icon: CheckCircle, text: 'Хорошо', color: 'text-primary', bg: 'bg-primary/20' };
      case 'risky':
        return { icon: AlertTriangle, text: 'Есть риски', color: 'text-warning', bg: 'bg-warning/20' };
      case 'incompatible':
        return { icon: XCircle, text: 'Конфликт', color: 'text-destructive', bg: 'bg-destructive/20' };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const getProgressColor = () => {
    if (volumePercentage > 80) return 'progress-danger';
    if (volumePercentage > 60) return 'progress-warning';
    return 'progress-safe';
  };

  if (config.selectedFish.length === 0) {
    return (
      <div className="glass-card p-6">
        <h4 className="font-semibold text-foreground mb-4">Ваш аквариум</h4>
        <div className="text-center py-8 text-muted-foreground">
          <p>Пока пусто</p>
          <p className="text-sm">Добавьте обитателей на шаге 2</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground">Ваш аквариум</h4>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bg}`}>
          <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
          <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.text}</span>
        </div>
      </div>

      {/* Volume progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Загрузка объёма</span>
          <span className="font-medium text-foreground">{Math.round(volumePercentage)}%</span>
        </div>
        <div className="h-2 rounded-full bg-card overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${getProgressColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${volumePercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Selected fish list */}
      <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto scrollbar-hide">
        {config.selectedFish.map((sf) => (
          <div
            key={sf.fish.id}
            className="flex items-center justify-between p-3 rounded-xl bg-card/50"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">{sf.fish.name}</div>
              <div className="text-xs text-muted-foreground">
                {sf.fish.zone === 'top' ? 'Верх' : sf.fish.zone === 'middle' ? 'Середина' : sf.fish.zone === 'bottom' ? 'Дно' : 'Все зоны'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateCount(sf.fish.id, sf.count - 1)}
                className="w-7 h-7 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-primary/50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center font-semibold text-foreground">{sf.count}</span>
              <button
                onClick={() => onUpdateCount(sf.fish.id, sf.count + 1)}
                className="w-7 h-7 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-primary/50"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={() => onRemove(sf.fish.id)}
                className="w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center hover:bg-destructive/30"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Warnings and conflicts */}
      {(conflicts.length > 0 || schoolingWarnings.length > 0) && (
        <div className="space-y-2">
          {conflicts.map((conflict, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 text-sm">
              <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <span className="text-destructive">{conflict}</span>
            </div>
          ))}
          {schoolingWarnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-warning/10 text-sm">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <span className="text-warning">{warning}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
