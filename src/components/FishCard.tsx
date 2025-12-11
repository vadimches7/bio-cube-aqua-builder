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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Генерируем варианты путей к изображению
  const getImageVariants = (): string[] => {
    const variants: string[] = [fish.image]; // Начинаем с основного пути
    
    // Если основной путь уже содержит /fish/, пробуем альтернативы
    if (fish.image.includes('/fish/')) {
      const baseName = fish.image.replace('/fish/', '').replace(/\.(jpg|png|webp)$/i, '');
      
      // Специальные маппинги для известных рыб
      const knownMappings: Record<string, string> = {
        'неон': 'neon-tetra',
        'неон голубой': 'neon-tetra',
        'paracheirodon innesi': 'neon-tetra',
        'гуппи': 'guppy',
        'poecilia reticulata': 'guppy',
      };
      
      const nameKey = fish.name.toLowerCase();
      if (knownMappings[nameKey] || knownMappings[fish.nameEn.toLowerCase()]) {
        const mappedName = knownMappings[nameKey] || knownMappings[fish.nameEn.toLowerCase()];
        variants.push(`/fish/${mappedName}.jpg`);
        variants.push(`/fish/${mappedName}.png`);
      }
      
      // Варианты: оригинальное имя рыбы (для файлов типа "Акара красногрудая.jpg")
      variants.push(`/fish/${fish.name}.jpg`);
      variants.push(`/fish/${fish.name}.png`);
      
      // Вариант: латинское имя (первое слово)
      const latinFirstWord = fish.nameEn.toLowerCase().split(' ')[0];
      variants.push(`/fish/${latinFirstWord}.jpg`);
      variants.push(`/fish/${latinFirstWord}.png`);
      
      // Вариант: id рыбы
      variants.push(`/fish/${fish.id}.jpg`);
      variants.push(`/fish/${fish.id}.png`);
    }
    
    return variants;
  };
  
  const imageVariants = getImageVariants();
  const currentImageSrc = imageVariants[currentImageIndex] || imageVariants[0];
  
  const handleImageError = () => {
    if (currentImageIndex < imageVariants.length - 1) {
      // Пробуем следующий вариант
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // Все варианты исчерпаны - показываем placeholder
      setImageError(true);
    }
  };

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
            key={currentImageIndex}
            src={currentImageSrc}
            alt={fish.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-20 h-20 opacity-40"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 20C35 20 25 30 25 45C25 50 27 54 30 57C28 60 27 63 27 66C27 75 35 82 45 82C47 82 49 81 51 80C53 81 55 82 57 82C67 82 75 75 75 66C75 63 74 60 72 57C75 54 77 50 77 45C77 30 67 20 52 20C51 20 50 20 50 20Z"
                fill="currentColor"
                className="text-primary"
              />
              <circle cx="42" cy="45" r="3" fill="white" />
              <path
                d="M30 60L25 65L30 70"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-primary"
              />
            </svg>
          </div>
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
