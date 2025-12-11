import { Fish, AquariumType, ExperienceLevel, FishZone, FishTemperament, WaterParams } from '@/types/aquarium';
import { ExternalFishData } from '@/types/fishDatabase';

const convertTemperament = (temperament: string): FishTemperament => {
  const lower = temperament.toLowerCase();
  if (lower.includes('мир') || lower.includes('peace')) return 'peaceful';
  if (lower.includes('полу') || lower.includes('террит') || lower.includes('semi')) return 'semi-aggressive';
  if (lower.includes('агр') || lower.includes('хищ') || lower.includes('pred')) return 'aggressive';
  return 'peaceful';
};

const convertDifficulty = (difficulty: number): ExperienceLevel => {
  if (difficulty === 3) return 'advanced';
  if (difficulty === 2) return 'intermediate';
  return 'beginner';
};

const convertCareLevel = (difficulty: number): string => {
  switch (difficulty) {
    case 1:
      return 'Лёгкий';
    case 2:
      return 'Средний';
    case 3:
      return 'Сложный';
    default:
      return 'Средний';
  }
};

const convertAquariumType = (type: string): AquariumType => {
  if (type === 'saltwater' || type === 'marine') return 'marine';
  return 'freshwater';
};

const determineZone = (familyGroup: string, sizeCm: number): FishZone => {
  const lower = familyGroup.toLowerCase();
  if (
    lower.includes('сом') ||
    lower.includes('коридорас') ||
    lower.includes('вьюн') ||
    lower.includes('беспозвоноч')
  ) {
    return 'bottom';
  }
  if (
    lower.includes('гуппи') ||
    lower.includes('молли') ||
    lower.includes('пецили') ||
    lower.includes('меченос')
  ) {
    return 'top';
  }
  if (sizeCm >= 20) {
    return 'all';
  }
  return 'middle';
};

const getCompatibleTypes = (type: string, reefSafe?: boolean): AquariumType[] => {
  const aquariumType = convertAquariumType(type);
  const types: AquariumType[] = [aquariumType];
  if (aquariumType === 'freshwater' && reefSafe) {
    types.push('planted');
  }
  return types;
};

export const convertExternalFishToAppFormat = (externalFish: ExternalFishData): Fish => {
  const id = `fish-${externalFish.id}`;
  const maxCount =
    externalFish.min_group_size && externalFish.min_group_size > 1
      ? Math.max(externalFish.min_group_size * 2, 10)
      : 1;

  const description =
    externalFish.description_short ||
    `${externalFish.name_ru} (${externalFish.name_lat}). Семейство: ${externalFish.family_group}. Размер до ${externalFish.size_cm} см.`;

  // Конвертируем параметры воды
  const waterParams: WaterParams | undefined = externalFish.water_params
    ? {
        phMin: externalFish.water_params.ph_min,
        phMax: externalFish.water_params.ph_max,
        tempMin: externalFish.water_params.temp_min,
        tempMax: externalFish.water_params.temp_max,
        salinity: externalFish.water_params.salinity,
      }
    : undefined;

  // Определяем путь к изображению
  let imagePath: string;
  
  if (externalFish.image_url) {
    // Если есть явно указанный image_url - используем его
    imagePath = externalFish.image_url.startsWith('/') || externalFish.image_url.startsWith('http')
      ? externalFish.image_url 
      : `/fish/${externalFish.image_url}`;
  } else {
    // Пытаемся найти изображение по имени рыбы
    // Транслитерация русского имени в латиницу
    const transliterate = (str: string): string => {
      const map: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      return str.toLowerCase()
        .split('')
        .map(char => map[char] || (char.match(/[a-z0-9]/) ? char : '-'))
        .join('')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };
    
    const cleanNameRu = externalFish.name_ru.toLowerCase().replace(/[()]/g, '').trim();
    const cleanNameLat = externalFish.name_lat.toLowerCase().split(' ')[0];
    
    // Специальные маппинги для известных рыб
    const knownMappings: Record<string, string> = {
      'неон голубой': 'neon-tetra',
      'неон': 'neon-tetra',
      'paracheirodon innesi': 'neon-tetra',
      'гуппи': 'guppy',
      'poecilia reticulata': 'guppy',
    };
    
    const nameKey = cleanNameRu.toLowerCase();
    if (knownMappings[nameKey] || knownMappings[externalFish.name_lat.toLowerCase()]) {
      const mappedName = knownMappings[nameKey] || knownMappings[externalFish.name_lat.toLowerCase()];
      imagePath = `/fish/${mappedName}.jpg`;
    } else {
      // Пробуем разные варианты имени (компонент будет пробовать их через onError)
      // Начинаем с транслитерации русского имени
      imagePath = `/fish/${transliterate(cleanNameRu)}.jpg`;
    }
  }

  return {
    id,
    name: externalFish.name_ru,
    nameEn: externalFish.name_lat,
    image: imagePath,
    minVolume: externalFish.min_tank_liters,
    maxCount,
    zone: determineZone(externalFish.family_group, externalFish.size_cm),
    temperament: convertTemperament(externalFish.temperament),
    schooling: externalFish.min_group_size > 1,
    minSchoolSize: externalFish.min_group_size > 1 ? externalFish.min_group_size : undefined,
    difficulty: convertDifficulty(externalFish.difficulty),
    compatibleTypes: getCompatibleTypes(externalFish.type, externalFish.reef_safe),
    incompatibleWith: [], // optional: fill later with compatibility matrix
    description,
    careLevel: convertCareLevel(externalFish.difficulty),
    waterParams,
    sizeCm: externalFish.size_cm,
    familyGroup: externalFish.family_group,
    incompatibleTags: externalFish.incompatible_tags || [],
    funFacts: externalFish.features_list && externalFish.features_list.length > 0
      ? externalFish.features_list
      : undefined,
  };
};

export const convertExternalFishArray = (externalFishArray: ExternalFishData[]): Fish[] => {
  return externalFishArray.map(convertExternalFishToAppFormat);
};

