import { ExternalFishData } from '@/types/fishDatabase';
import { convertExternalFishArray } from '@/utils/fishDataConverter';
import { Fish } from '@/types/aquarium';

import freshwaterSpecies from './freshwater_species.json';
import marineSpecies from './marine_species.json';

export const getAllExternalFishData = (): ExternalFishData[] => {
  const all: ExternalFishData[] = [];
  if (Array.isArray(freshwaterSpecies)) {
    all.push(...(freshwaterSpecies as ExternalFishData[]));
  }
  if (Array.isArray(marineSpecies)) {
    all.push(...(marineSpecies as ExternalFishData[]));
  }
  return all;
};

export const CONVERTED_FISH_DATABASE: Fish[] = convertExternalFishArray(getAllExternalFishData());

