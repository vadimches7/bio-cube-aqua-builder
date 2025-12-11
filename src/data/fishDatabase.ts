import { Fish, AquariumType } from '@/types/aquarium';
import { CONVERTED_FISH_DATABASE } from './loadFishData';
import { updateFishIncompatibility } from '@/utils/compatibilityMatrix';

// Ручные позиции отключены: работаем только с выгрузкой конкурента
const BASE_FISH_DATABASE: Fish[] = [];

// Итоговый список: ручные + сконвертированные из внешних JSON (без дубликатов по id)
const ALL_FISH: Fish[] = [
  ...BASE_FISH_DATABASE,
  ...CONVERTED_FISH_DATABASE.filter(
    (fish) => !BASE_FISH_DATABASE.some((baseFish) => baseFish.id === fish.id)
  ),
];

// Автоматически обновляем матрицу совместимости на основе тегов
export const FISH_DATABASE: Fish[] = updateFishIncompatibility(ALL_FISH);

export const getFishByType = (type: AquariumType): Fish[] => {
  if (type === 'planted') {
    return FISH_DATABASE.filter(
      (fish) => fish.compatibleTypes.includes('freshwater') || fish.compatibleTypes.includes('planted')
    );
  }

  if (type === 'pseudomarine') {
    return FISH_DATABASE.filter(
      (fish) => fish.compatibleTypes.includes('marine') || fish.compatibleTypes.includes('pseudomarine')
    );
  }

  return FISH_DATABASE.filter((fish) => fish.compatibleTypes.includes(type));
};

export const getFishById = (id: string): Fish | undefined => {
  return FISH_DATABASE.find((fish) => fish.id === id);
};
