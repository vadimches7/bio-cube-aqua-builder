import { motion } from 'framer-motion';
import { AquariumConfig, AQUARIUM_TYPES } from '@/types/aquarium';

interface AquariumPreviewProps {
  config: AquariumConfig;
}

export const AquariumPreview = ({ config }: AquariumPreviewProps) => {
  const typeInfo = AQUARIUM_TYPES.find(t => t.id === config.type);
  
  // Calculate fill level based on selected fish
  const totalFishVolume = config.selectedFish.reduce((acc, sf) => {
    return acc + (sf.fish.minVolume * sf.count * 0.5);
  }, 0);
  const fillPercentage = Math.min((totalFishVolume / config.volume) * 100, 100);
  
  // Determine color based on compatibility
  const getWaterColor = () => {
    if (fillPercentage > 80) return 'from-destructive/30 to-destructive/10';
    if (fillPercentage > 60) return 'from-warning/30 to-warning/10';
    return 'from-primary/30 to-accent/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Header info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{typeInfo?.name || 'Аквариум'}</h3>
          <p className="text-sm text-muted-foreground">{config.volume}L • {config.interiorStyle}</p>
        </div>
        <div className="badge-premium">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-foreground">Превью</span>
        </div>
      </div>

      {/* Aquarium visualization */}
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-ocean-deep border border-glass/10">
        {/* Glass frame effect */}
        <div className="absolute inset-0 rounded-2xl border-4 border-glass/5 z-20 pointer-events-none" />
        
        {/* Top light reflection */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-glass/10 to-transparent z-10" />
        
        {/* Water */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getWaterColor()}`}
          initial={{ height: '70%' }}
          animate={{ height: '70%' }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Light rays */}
        <div className="absolute top-0 left-1/4 w-16 h-full bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-xl" />
        <div className="absolute top-0 right-1/3 w-12 h-full bg-gradient-to-b from-accent/15 via-accent/5 to-transparent blur-xl" />
        
        {/* Animated fish */}
        {config.selectedFish.slice(0, 8).map((sf, index) => (
          <motion.div
            key={sf.fish.id}
            className="absolute"
            style={{
              top: sf.fish.zone === 'top' ? '15%' : sf.fish.zone === 'bottom' ? '65%' : '40%',
            }}
            animate={{
              x: ['0%', `${150 + index * 30}%`, '0%'],
              y: [0, index % 2 === 0 ? 10 : -10, 0],
            }}
            transition={{
              duration: 6 + index,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.3,
            }}
          >
            <div 
              className="w-6 h-3 rounded-full bg-gradient-to-r from-primary/60 to-accent/40"
              style={{
                transform: `scale(${0.8 + (sf.count * 0.1)})`,
              }}
            />
          </motion.div>
        ))}
        
        {/* Bubbles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-glass/30"
            style={{
              left: `${20 + i * 12}%`,
              bottom: '10%',
            }}
            animate={{
              y: [0, -200],
              opacity: [0.6, 0],
              scale: [1, 0.5],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
            }}
          />
        ))}
        
        {/* Plants/decoration based on type */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4">
          {config.type === 'planted' && (
            <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-success/40 to-transparent" />
          )}
          {config.type === 'pseudomarine' && (
            <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-accent/30 to-transparent" />
          )}
          {config.type === 'cichlid' && (
            <div className="absolute bottom-0 left-1/4 right-1/4 h-1/2 rounded-t-full bg-gradient-to-t from-muted/50 to-transparent" />
          )}
          {/* Sand/gravel base */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-muted/30 to-transparent" />
        </div>
        
        {/* Glass reflection */}
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-glass/5 to-transparent pointer-events-none" />
        
        {/* Empty state text */}
        {config.selectedFish.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground/50 text-sm">Добавьте обитателей</p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gradient">{config.selectedFish.length}</div>
          <div className="text-xs text-muted-foreground">Видов</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gradient">
            {config.selectedFish.reduce((acc, sf) => acc + sf.count, 0)}
          </div>
          <div className="text-xs text-muted-foreground">Особей</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gradient">{Math.round(fillPercentage)}%</div>
          <div className="text-xs text-muted-foreground">Загрузка</div>
        </div>
      </div>
    </motion.div>
  );
};
