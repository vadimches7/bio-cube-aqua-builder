// External fish data format (raw JSON)
export interface ExternalFishData {
  id: number;
  name_ru: string;
  name_lat: string;
  type: string; // freshwater | saltwater | marine
  family_group: string;
  size_cm: number;
  min_tank_liters: number;
  bio_load_points: number;
  temperament: string;
  min_group_size: number;
  difficulty: number; // 1..3
  reef_safe?: boolean;
  water_params: {
    ph_min?: number;
    ph_max?: number;
    temp_min?: number;
    temp_max?: number;
    salinity?: number;
  };
  incompatible_tags: string[];
  description_short?: string;
  features_list?: string[];
}

