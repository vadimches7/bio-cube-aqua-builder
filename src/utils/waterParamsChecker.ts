import { Fish, WaterParams, SelectedFish } from '@/types/aquarium';

/**
 * Проверяет совместимость параметров воды между рыбами
 */
export interface WaterCompatibilityResult {
  isCompatible: boolean;
  warnings: string[];
  optimalPh?: { min: number; max: number };
  optimalTemp?: { min: number; max: number };
  conflicts: Array<{
    fish1: string;
    fish2: string;
    issue: string;
  }>;
}

/**
 * Находит пересечение диапазонов pH
 */
function findPhOverlap(ph1: { min: number; max: number }, ph2: { min: number; max: number }): { min: number; max: number } | null {
  const min = Math.max(ph1.min, ph2.min);
  const max = Math.min(ph1.max, ph2.max);
  
  if (min <= max) {
    return { min, max };
  }
  return null;
}

/**
 * Находит пересечение диапазонов температуры
 */
function findTempOverlap(temp1: { min: number; max: number }, temp2: { min: number; max: number }): { min: number; max: number } | null {
  const min = Math.max(temp1.min, temp2.min);
  const max = Math.min(temp1.max, temp2.max);
  
  if (min <= max) {
    return { min, max };
  }
  return null;
}

/**
 * Проверяет совместимость параметров воды для списка рыб
 */
export function checkWaterParamsCompatibility(selectedFish: SelectedFish[]): WaterCompatibilityResult {
  const result: WaterCompatibilityResult = {
    isCompatible: true,
    warnings: [],
    conflicts: [],
  };

  // Фильтруем рыб с параметрами воды
  const fishWithParams = selectedFish.filter(sf => sf.fish.waterParams);

  if (fishWithParams.length === 0) {
    return result; // Нет данных о параметрах воды
  }

  if (fishWithParams.length === 1) {
    const fish = fishWithParams[0].fish;
    if (fish.waterParams) {
      if (fish.waterParams.phMin !== undefined && fish.waterParams.phMax !== undefined) {
        result.optimalPh = { min: fish.waterParams.phMin, max: fish.waterParams.phMax };
      }
      if (fish.waterParams.tempMin !== undefined && fish.waterParams.tempMax !== undefined) {
        result.optimalTemp = { min: fish.waterParams.tempMin, max: fish.waterParams.tempMax };
      }
    }
    return result;
  }

  // Собираем все диапазоны pH и температуры
  const phRanges: Array<{ min: number; max: number; fishName: string }> = [];
  const tempRanges: Array<{ min: number; max: number; fishName: string }> = [];

  fishWithParams.forEach(sf => {
    const params = sf.fish.waterParams;
    if (params?.phMin !== undefined && params?.phMax !== undefined) {
      phRanges.push({
        min: params.phMin,
        max: params.phMax,
        fishName: sf.fish.name,
      });
    }
    if (params?.tempMin !== undefined && params?.tempMax !== undefined) {
      tempRanges.push({
        min: params.tempMin,
        max: params.tempMax,
        fishName: sf.fish.name,
      });
    }
  });

  // Проверяем совместимость pH
  if (phRanges.length > 1) {
    let commonPhRange: { min: number; max: number } | null = phRanges[0];
    
    for (let i = 1; i < phRanges.length; i++) {
      if (commonPhRange) {
        commonPhRange = findPhOverlap(commonPhRange, phRanges[i]);
      }
    }

    if (commonPhRange) {
      result.optimalPh = commonPhRange;
      const range = commonPhRange.max - commonPhRange.min;
      if (range < 0.5) {
        result.warnings.push(`Узкий диапазон pH: ${commonPhRange.min.toFixed(1)}-${commonPhRange.max.toFixed(1)}. Требуется точный контроль.`);
      }
    } else {
      result.isCompatible = false;
      // Находим конфликты
      for (let i = 0; i < phRanges.length; i++) {
        for (let j = i + 1; j < phRanges.length; j++) {
          if (!findPhOverlap(phRanges[i], phRanges[j])) {
            result.conflicts.push({
              fish1: phRanges[i].fishName,
              fish2: phRanges[j].fishName,
              issue: `Конфликт pH: ${phRanges[i].fishName} требует pH ${phRanges[i].min.toFixed(1)}-${phRanges[i].max.toFixed(1)}, а ${phRanges[j].fishName} - ${phRanges[j].min.toFixed(1)}-${phRanges[j].max.toFixed(1)}`,
            });
          }
        }
      }
      result.warnings.push('⚠️ Рыбы требуют разные значения pH. Совместное содержание проблематично.');
    }
  } else if (phRanges.length === 1) {
    result.optimalPh = { min: phRanges[0].min, max: phRanges[0].max };
  }

  // Проверяем совместимость температуры
  if (tempRanges.length > 1) {
    let commonTempRange: { min: number; max: number } | null = tempRanges[0];
    
    for (let i = 1; i < tempRanges.length; i++) {
      if (commonTempRange) {
        commonTempRange = findTempOverlap(commonTempRange, tempRanges[i]);
      }
    }

    if (commonTempRange) {
      result.optimalTemp = commonTempRange;
      const range = commonTempRange.max - commonTempRange.min;
      if (range < 2) {
        result.warnings.push(`Узкий диапазон температуры: ${commonTempRange.min}-${commonTempRange.max}°C. Требуется точный контроль.`);
      }
    } else {
      result.isCompatible = false;
      // Находим конфликты
      for (let i = 0; i < tempRanges.length; i++) {
        for (let j = i + 1; j < tempRanges.length; j++) {
          if (!findTempOverlap(tempRanges[i], tempRanges[j])) {
            result.conflicts.push({
              fish1: tempRanges[i].fishName,
              fish2: tempRanges[j].fishName,
              issue: `Конфликт температуры: ${tempRanges[i].fishName} требует ${tempRanges[i].min}-${tempRanges[i].max}°C, а ${tempRanges[j].fishName} - ${tempRanges[j].min}-${tempRanges[j].max}°C`,
            });
          }
        }
      }
      result.warnings.push('⚠️ Рыбы требуют разные температуры. Совместное содержание проблематично.');
    }
  } else if (tempRanges.length === 1) {
    result.optimalTemp = { min: tempRanges[0].min, max: tempRanges[0].max };
  }

  return result;
}

/**
 * Форматирует параметры воды для отображения
 */
export function formatWaterParams(params: WaterParams): string {
  const parts: string[] = [];
  
  if (params.phMin !== undefined && params.phMax !== undefined) {
    parts.push(`pH: ${params.phMin.toFixed(1)}-${params.phMax.toFixed(1)}`);
  }
  
  if (params.tempMin !== undefined && params.tempMax !== undefined) {
    parts.push(`${params.tempMin}-${params.tempMax}°C`);
  }
  
  return parts.join(', ') || 'Не указано';
}

/**
 * Получает оптимальные параметры воды для группы рыб
 */
export function getOptimalWaterParams(selectedFish: SelectedFish[]): WaterParams | null {
  const compatibility = checkWaterParamsCompatibility(selectedFish);
  
  if (!compatibility.optimalPh && !compatibility.optimalTemp) {
    return null;
  }
  
  return {
    phMin: compatibility.optimalPh?.min,
    phMax: compatibility.optimalPh?.max,
    tempMin: compatibility.optimalTemp?.min,
    tempMax: compatibility.optimalTemp?.max,
  };
}

