// Types for the Bio-Cube aquarium configurator

export type AquariumType = 'freshwater' | 'planted' | 'pseudomarine' | 'shrimp' | 'cichlid' | 'marine';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type InteriorStyle = 'minimalism' | 'loft' | 'scandi' | 'hightech';

export type FishZone = 'top' | 'middle' | 'bottom' | 'all';

export type FishTemperament = 'peaceful' | 'semi-aggressive' | 'aggressive';

export type CompatibilityStatus = 'excellent' | 'good' | 'risky' | 'incompatible';

export interface WaterParams {
  phMin?: number;
  phMax?: number;
  tempMin?: number;
  tempMax?: number;
  salinity?: number;
}

export interface Fish {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  minVolume: number;
  maxCount: number;
  zone: FishZone;
  temperament: FishTemperament;
  schooling: boolean;
  minSchoolSize?: number;
  difficulty: ExperienceLevel;
  compatibleTypes: AquariumType[];
  incompatibleWith: string[];
  description: string;
  careLevel: string;
  waterParams?: WaterParams; // Параметры воды
  sizeCm?: number; // Размер рыбы в см
  familyGroup?: string; // Семейство
  incompatibleTags?: string[]; // Теги несовместимости
  funFacts?: string[]; // Уникальные особенности/факты
}

export interface SelectedFish {
  fish: Fish;
  count: number;
}

export interface AquariumConfig {
  type: AquariumType;
  volume: number;
  experienceLevel: ExperienceLevel;
  interiorStyle: InteriorStyle;
  selectedFish: SelectedFish[];
  backgroundVideo?: string; // URL или путь к видео для фона
}

export interface CompatibilityResult {
  status: CompatibilityStatus;
  volumeUsed: number;
  volumeCapacity: number;
  warnings: string[];
  conflicts: string[];
  waterParamsWarnings?: string[]; // Предупреждения о параметрах воды
  optimalWaterParams?: WaterParams; // Оптимальные параметры воды
}

export const AQUARIUM_TYPES: { id: AquariumType; name: string; description: string }[] = [
  { id: 'freshwater', name: 'Общий', description: 'Классический пресноводный аквариум' },
  { id: 'planted', name: 'Травник', description: 'Акцент на живых растениях' },
  { id: 'pseudomarine', name: 'Псевдоморе', description: 'Морской стиль без морской воды' },
  { id: 'shrimp', name: 'Креветочник', description: 'Для любителей креветок' },
  { id: 'cichlid', name: 'Цихлидник', description: 'Для африканских и американских цихлид' },
  { id: 'marine', name: 'Морской', description: 'Настоящий морской аквариум' },
];

export const EXPERIENCE_LEVELS: { id: ExperienceLevel; name: string }[] = [
  { id: 'beginner', name: 'Новичок' },
  { id: 'intermediate', name: 'Уже разбираюсь' },
  { id: 'advanced', name: 'Продвинутый' },
];

export const INTERIOR_STYLES: { id: InteriorStyle; name: string }[] = [
  { id: 'minimalism', name: 'Минимализм' },
  { id: 'loft', name: 'Лофт' },
  { id: 'scandi', name: 'Сканди' },
  { id: 'hightech', name: 'Хайтек' },
];
