import { Fish } from '@/types/aquarium';

/**
 * Матрица совместимости тегов
 * Определяет, какие теги несовместимы друг с другом
 */
const INCOMPATIBILITY_MATRIX: Record<string, string[]> = {
  // Хищники и маленькие рыбы
  'large_predator': ['small_fish', 'nano_fish', 'shrimp'],
  'predator': ['small_fish', 'nano_fish'],
  
  // Обкусыватели плавников
  'fin_nipper': ['long_finned_fish', 'veil_tail', 'betta'],
  
  // Параметры воды
  'high_ph_water': ['low_ph_water', 'acid_loving'],
  'low_ph_water': ['high_ph_water', 'alkaline_loving'],
  'acid_loving': ['high_ph_water', 'alkaline_loving'],
  'alkaline_loving': ['low_ph_water', 'acid_loving'],
  
  // Температура
  'cold_water': ['tropical', 'warm_water'],
  'tropical': ['cold_water'],
  'warm_water': ['cold_water'],
  
  // Агрессивность
  'aggressive': ['peaceful', 'shy', 'delicate'],
  'territorial': ['peaceful', 'shy'],
  'peaceful': ['aggressive', 'predator'],
  
  // Размер
  'small_fish': ['large_predator', 'predator'],
  'nano_fish': ['large_predator', 'predator'],
  
  // Специфичные рыбы
  'shrimp': ['large_predator', 'predator', 'aggressive'],
  'long_finned_fish': ['fin_nipper'],
  'veil_tail': ['fin_nipper'],
  'betta': ['fin_nipper', 'aggressive'],
};

/**
 * Проверяет совместимость двух рыб на основе их тегов
 */
export function areFishCompatible(fish1: Fish, fish2: Fish): {
  compatible: boolean;
  reason?: string;
} {
  // Если у рыб нет тегов, считаем совместимыми
  if (!fish1.incompatibleTags || !fish2.incompatibleTags) {
    return { compatible: true };
  }

  // Проверяем каждый тег первой рыбы против тегов второй
  for (const tag1 of fish1.incompatibleTags) {
    const incompatibleTags = INCOMPATIBILITY_MATRIX[tag1] || [];
    
    for (const tag2 of fish2.incompatibleTags) {
      if (incompatibleTags.includes(tag2)) {
        return {
          compatible: false,
          reason: `${fish1.name} (${tag1}) несовместима с ${fish2.name} (${tag2})`,
        };
      }
    }
  }

  // Проверяем в обратную сторону
  for (const tag2 of fish2.incompatibleTags) {
    const incompatibleTags = INCOMPATIBILITY_MATRIX[tag2] || [];
    
    for (const tag1 of fish1.incompatibleTags) {
      if (incompatibleTags.includes(tag1)) {
        return {
          compatible: false,
          reason: `${fish2.name} (${tag2}) несовместима с ${fish1.name} (${tag1})`,
        };
      }
    }
  }

  return { compatible: true };
}

/**
 * Автоматически заполняет incompatibleWith для всех рыб на основе тегов
 */
export function buildCompatibilityMatrix(fishList: Fish[]): Map<string, string[]> {
  const compatibilityMap = new Map<string, string[]>();

  for (const fish1 of fishList) {
    const incompatibleIds: string[] = [];

    for (const fish2 of fishList) {
      if (fish1.id !== fish2.id) {
        const { compatible } = areFishCompatible(fish1, fish2);
        if (!compatible) {
          incompatibleIds.push(fish2.id);
        }
      }
    }

    compatibilityMap.set(fish1.id, incompatibleIds);
  }

  return compatibilityMap;
}

/**
 * Обновляет массив рыб, добавляя информацию о несовместимости
 */
export function updateFishIncompatibility(fishList: Fish[]): Fish[] {
  const compatibilityMap = buildCompatibilityMatrix(fishList);

  return fishList.map(fish => {
    const incompatibleIds = compatibilityMap.get(fish.id) || [];
    // Объединяем существующие и новые несовместимости
    const allIncompatible = [...new Set([...fish.incompatibleWith, ...incompatibleIds])];
    
    return {
      ...fish,
      incompatibleWith: allIncompatible,
    };
  });
}

/**
 * Получает человекочитаемое описание тега
 */
export function getTagDescription(tag: string): string {
  const descriptions: Record<string, string> = {
    'large_predator': 'Крупный хищник',
    'predator': 'Хищник',
    'small_fish': 'Маленькая рыба',
    'nano_fish': 'Нано-рыба',
    'fin_nipper': 'Обкусывает плавники',
    'long_finned_fish': 'Длинноплавниковая',
    'veil_tail': 'Вуалехвост',
    'betta': 'Бойцовая',
    'high_ph_water': 'Высокий pH',
    'low_ph_water': 'Низкий pH',
    'acid_loving': 'Кислая вода',
    'alkaline_loving': 'Щелочная вода',
    'cold_water': 'Холодная вода',
    'tropical': 'Тропическая',
    'warm_water': 'Теплая вода',
    'aggressive': 'Агрессивная',
    'territorial': 'Территориальная',
    'peaceful': 'Мирная',
    'shrimp': 'Креветка',
    'shy': 'Робкая',
    'delicate': 'Нежная',
  };

  return descriptions[tag] || tag;
}

