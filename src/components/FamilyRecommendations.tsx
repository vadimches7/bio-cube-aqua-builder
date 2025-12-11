import { Fish, AquariumConfig } from '@/types/aquarium';
import { motion } from 'framer-motion';
import { Users, Sparkles } from 'lucide-react';
import { FishCard } from './FishCard';

interface FamilyRecommendationsProps {
  config: AquariumConfig;
  availableFish: Fish[];
  onFishClick: (fish: Fish) => void;
  isSelected: (fishId: string) => boolean;
}

export const FamilyRecommendations = ({
  config,
  availableFish,
  onFishClick,
  isSelected,
}: FamilyRecommendationsProps) => {
  // Получаем семейства выбранных рыб
  const selectedFamilies = new Set(
    config.selectedFish
      .map(sf => sf.fish.familyGroup)
      .filter((family): family is string => !!family)
  );

  if (selectedFamilies.size === 0) {
    return null;
  }

  // Находим рыб из тех же семейств, которые еще не выбраны
  const recommendedFish = availableFish.filter(fish => {
    if (!fish.familyGroup) return false;
    if (isSelected(fish.id)) return false; // Уже выбрана
    if (!config.selectedFish.some(sf => sf.fish.id === fish.id)) {
      // Проверяем совместимость с уже выбранными
      const isCompatible = !config.selectedFish.some(sf =>
        sf.fish.incompatibleWith.includes(fish.id) ||
        fish.incompatibleWith.includes(sf.fish.id)
      );
      
      // Проверяем совместимость по типу аквариума
      const matchesType = fish.compatibleTypes.includes(config.type);
      
      // Проверяем уровень опыта
      const matchesLevel = config.experienceLevel === 'advanced' ||
        (config.experienceLevel === 'intermediate' && fish.difficulty !== 'advanced') ||
        (config.experienceLevel === 'beginner' && fish.difficulty === 'beginner');
      
      return selectedFamilies.has(fish.familyGroup) && isCompatible && matchesType && matchesLevel;
    }
    return false;
  });

  if (recommendedFish.length === 0) {
    return null;
  }

  // Группируем по семействам
  const fishByFamily = new Map<string, Fish[]>();
  recommendedFish.forEach(fish => {
    if (fish.familyGroup) {
      const family = fish.familyGroup;
      if (!fishByFamily.has(family)) {
        fishByFamily.set(family, []);
      }
      fishByFamily.get(family)!.push(fish);
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-foreground">Рекомендации по семействам</h4>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Вы уже выбрали рыб из семейств: {Array.from(selectedFamilies).join(', ')}. 
        Вот другие совместимые виды из этих семейств:
      </p>
      
      <div className="space-y-4">
        {Array.from(fishByFamily.entries()).map(([family, fish]) => (
          <div key={family}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{family}</span>
              <span className="text-xs text-muted-foreground">({fish.length} {fish.length === 1 ? 'вид' : 'вида'})</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {fish.slice(0, 6).map(fishItem => (
                <FishCard
                  key={fishItem.id}
                  fish={fishItem}
                  selected={isSelected(fishItem.id)}
                  onClick={() => onFishClick(fishItem)}
                />
              ))}
            </div>
            {fish.length > 6 && (
              <p className="text-xs text-muted-foreground mt-2">
                И еще {fish.length - 6} {fish.length - 6 === 1 ? 'вид' : 'видов'} из этого семейства
              </p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
