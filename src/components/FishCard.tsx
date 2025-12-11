import { useState } from 'react';
import { Fish } from '@/types/aquarium';
import { motion } from 'framer-motion';
import { Droplets, Users } from 'lucide-react';

interface FishCardProps {
  fish: Fish;
  selected: boolean;
  onClick: () => void;
}

export const FishCard = ({ fish, selected, onClick }: FishCardProps) => {
  const [imageError, setImageError] = useState(false);

  const getZoneIcon = () => {
    switch (fish.zone) {
      case 'top': return '↑';
      case 'middle': return '↔';
      case 'bottom': return '↓';
      default: return '◎';
    }
  };

  const getTemperamentColor = () => {
    switch (fish.temperament) {
      case 'peaceful': return 'bg-success/20 text-success';
      case 'semi-aggressive': return 'bg-warning/20 text-warning';
      case 'aggressive': return 'bg-destructive/20 text-destructive';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full text-left p-4 rounded-2xl transition-all duration-300 ${
        selected
          ? 'bg-primary/20 border-2 border-primary shadow-glow'
          : 'glass-card-hover'
      }`}
    >
      {/* Fish image */}
      <div className="aspect-[4/3] rounded-xl mb-3 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center relative">
        {!imageError ? (
          <img
            src={fish.image}
            alt={fish.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-4xl opacity-60"
          >
            🐠
          </motion.div>
        )}
      </div>

      <h4 className="font-semibold text-foreground mb-1 truncate">{fish.name}</h4>
      <p className="text-xs text-muted-foreground mb-3">{fish.nameEn}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getTemperamentColor()}`}>
          {fish.temperament === 'peaceful' ? 'Мирная' : fish.temperament === 'semi-aggressive' ? 'Полуагр.' : 'Агресс.'}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-card text-muted-foreground">
          {getZoneIcon()} {fish.zone === 'top' ? 'Верх' : fish.zone === 'middle' ? 'Сред.' : fish.zone === 'bottom' ? 'Дно' : 'Все'}
        </span>
        {fish.schooling && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-accent/20 text-accent">
            <Users className="w-3 h-3" /> Стая
          </span>
        )}
      </div>

      {/* Min volume indicator */}
      <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
        <Droplets className="w-3 h-3" />
        <span>от {fish.minVolume}L</span>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-sm">✓</span>
        </div>
      )}
    </motion.button>
  );
};
