import { useState } from 'react';
import { motion } from 'framer-motion';
import { AquariumConfig, AQUARIUM_TYPES } from '@/types/aquarium';

interface AquariumPreviewProps {
  config: AquariumConfig;
}

export const AquariumPreview = ({ config }: AquariumPreviewProps) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const typeInfo = AQUARIUM_TYPES.find(t => t.id === config.type);
  
  // Calculate fill level based on selected fish
  const totalFishVolume = config.selectedFish.reduce((acc, sf) => {
    return acc + sf.fish.minVolume * sf.count * 0.5;
  }, 0);
  const fillPercentage = Math.min((totalFishVolume / config.volume) * 100, 100);
  const waterHeight = `${Math.max(18, Math.min(88, 28 + fillPercentage * 0.6))}%`;
  
  // Determine color based on compatibility
  const getWaterColor = () => {
    if (fillPercentage > 80) return 'from-destructive/40 via-destructive/25 to-destructive/15';
    if (fillPercentage > 60) return 'from-warning/35 via-warning/20 to-warning/10';
    return 'from-primary/35 via-primary/20 to-accent/15';
  };

  const getFishHue = (temperament: string) => {
    if (temperament === 'aggressive') return 'from-[#ff6b6b] via-[#ff9f43] to-[#ffd166]';
    if (temperament === 'semi-aggressive') return 'from-[#5ad8ff] via-[#7cf3c8] to-[#a0f0ff]';
    return 'from-[#6ee7b7] via-[#4ade80] to-[#34d399]';
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
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-b from-[#0d1a24] via-[#0a121a] to-[#0a161f] border border-glass/10 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.65)]">
        {/* Glass frame effect */}
        <div className="absolute inset-0 rounded-2xl border border-glass/10 shadow-inner pointer-events-none" />
        
        {/* Top light reflection */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/10 via-white/5 to-transparent z-10" />

        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(71,255,235,0.08),transparent_35%),radial-gradient(circle_at_80%_25%,rgba(120,190,255,0.08),transparent_30%)]" />
        
        {/* Water fill */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getWaterColor()} backdrop-blur-[1px]`}
          initial={{ height: waterHeight }}
          animate={{ height: waterHeight }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Surface shine */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white/15 to-transparent" />
          {/* Caustics */}
          <div className="absolute inset-0 mix-blend-screen opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_70%_10%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_40%_70%,rgba(255,255,255,0.08),transparent_26%)] animate-pulse" />
          {/* Soft wave */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-8 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_70%_40%,rgba(255,255,255,0.12),transparent_40%)] opacity-50"
            animate={{ x: ['0%', '6%', '-4%', '0%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        
        {/* Light rays */}
        <div className="absolute top-0 left-1/4 w-16 h-full bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-2xl" />
        <div className="absolute top-0 right-1/3 w-12 h-full bg-gradient-to-b from-accent/15 via-accent/5 to-transparent blur-2xl" />

        {/* Foreground vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.25)_90%)] pointer-events-none" />

        {/* Animated fish */}
        {config.selectedFish.slice(0, 8).map((sf, index) => {
          const zoneTop = sf.fish.zone === 'top' ? '18%' : sf.fish.zone === 'bottom' ? '70%' : '44%';
          const scale = Math.min(1.4, 0.8 + sf.count * 0.12);
          const fishSize = Math.min(80, 40 + sf.count * 8);
          const hasImageError = imageErrors.has(sf.fish.id);
          // Распределяем рыб по горизонтали, но они остаются на месте
          const leftPosition = `${15 + (index % 4) * 25}%`;
          
          return (
            <motion.div
              key={sf.fish.id}
              className="absolute"
              style={{
                top: zoneTop,
                left: leftPosition,
              }}
              animate={{
                y: [0, index % 2 === 0 ? 8 : -8, 0],
                x: [0, index % 3 === 0 ? 3 : -3, 0],
              }}
              transition={{
                duration: 3 + index * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.2,
              }}
            >
              <div
                className="relative"
                style={{ transform: `scale(${scale})` }}
              >
                {!hasImageError ? (
                  <>
                    {/* Fish image */}
                    <img
                      src={sf.fish.image}
                      alt={sf.fish.name}
                      className="w-auto h-auto object-contain"
                      style={{
                        width: `${fishSize}px`,
                        height: 'auto',
                        filter: 'drop-shadow(0 0 8px rgba(53, 255, 200, 0.6)) brightness(1.1)',
                        imageRendering: 'auto',
                      }}
                      onError={() => {
                        setImageErrors(prev => new Set(prev).add(sf.fish.id));
                      }}
                    />
                    {/* bubble trail */}
                    <motion.div
                      className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/40"
                      animate={{ y: [0, -10], opacity: [0.8, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                    />
                  </>
                ) : (
                  <>
                    {/* Fallback abstract fish */}
                    <div
                      className="relative"
                      style={{ width: `${fishSize}px`, height: `${fishSize * 0.4}px` }}
                    >
                      {/* body */}
                      <div
                        className={`w-full h-full rounded-full bg-gradient-to-r ${getFishHue(sf.fish.temperament)} shadow-[0_0_14px_-6px_rgba(53,255,200,0.8)]`}
                      />
                      {/* tail */}
                      <div
                        className="absolute right-[-6px] top-1/2 -translate-y-1/2 h-2 w-3 bg-gradient-to-r from-white/60 to-white/10 rounded-sm skew-x-6"
                      />
                      {/* eye */}
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
                    </div>
                    {/* bubble trail */}
                    <motion.div
                      className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/40"
                      animate={{ y: [0, -10], opacity: [0.8, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                    />
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
        
        {/* Bubbles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-glass/30"
            style={{
              left: `${20 + i * 12}%`,
              bottom: '12%',
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
        
        {/* Floating particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`p-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/25 blur-[1px]"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + (i % 5) * 12}%`,
            }}
            animate={{
              y: [0, i % 2 === 0 ? -12 : 12, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
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
