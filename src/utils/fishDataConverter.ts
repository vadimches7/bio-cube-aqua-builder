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
    `${externalFish.name_ru} (${externalFish.name_lat}). ${externalFish.family_group}. Размер до ${externalFish.size_cm} см.`;

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

  return {
    id,
    name: externalFish.name_ru,
    nameEn: externalFish.name_lat,
    image: `/fish/${id}.jpg`,
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
  };
};

export const convertExternalFishArray = (externalFishArray: ExternalFishData[]): Fish[] => {
  return externalFishArray.map(convertExternalFishToAppFormat);
};

