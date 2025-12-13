import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AquariumConfig, SelectedFish, Fish } from '@/types/aquarium';
import { getFishByType } from '@/data/fishDatabase';
import { getTagDescription } from '@/utils/compatibilityMatrix';
import { Button } from '@/components/ui/button';
import { FishCard } from './FishCard';
import { FishModal } from './FishModal';
import { WaterParamsFilter } from './WaterParamsFilter';
import { FamilyRecommendations } from './FamilyRecommendations';
import { ArrowLeft, ArrowRight, Search, X } from 'lucide-react';

interface ConfiguratorStep2Props {
  config: AquariumConfig;
  onAddFish: (fish: SelectedFish) => void;
  onBack: () => void;
  onNext: () => void;
}

export const ConfiguratorStep2 = ({ config, onAddFish, onBack, onNext }: ConfiguratorStep2Props) => {
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [catalogType, setCatalogType] = useState(config.type);
  const [phMinFilter, setPhMinFilter] = useState<number | undefined>(undefined);
  const [phMaxFilter, setPhMaxFilter] = useState<number | undefined>(undefined);
  const [tempMinFilter, setTempMinFilter] = useState<number | undefined>(undefined);
  const [tempMaxFilter, setTempMaxFilter] = useState<number | undefined>(undefined);

  const availableFish = getFishByType(catalogType);
  
  const filteredFish = availableFish.filter(fish => {
    // Расширенный поиск
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const searchInName = fish.name.toLowerCase().includes(query) ||
                         fish.nameEn.toLowerCase().includes(query);
      const searchInDescription = fish.description?.toLowerCase().includes(query) || false;
      const searchInFamily = fish.familyGroup?.toLowerCase().includes(query) || false;
      
      // Поиск по тегам
      const searchInTags = fish.incompatibleTags?.some(tag => {
        const tagDescription = getTagDescription(tag).toLowerCase();
        return tagDescription.includes(query) || tag.toLowerCase().includes(query);
      }) || false;
      
      // Поиск по темпераменту
      const temperamentMap: Record<string, string[]> = {
        'мирная': ['peaceful'],
        'мирная рыба': ['peaceful'],
        'агрессивная': ['aggressive', 'semi-aggressive'],
        'агрессивная рыба': ['aggressive', 'semi-aggressive'],
        'полуагрессивная': ['semi-aggressive'],
        'стайная': ['schooling'],
        'стайная рыба': ['schooling'],
        'хищник': ['predator', 'large_predator'],
        'хищная': ['predator', 'large_predator'],
      };
      const searchInTemperament = Object.entries(temperamentMap).some(([key, values]) => {
        if (query.includes(key)) {
          return values.includes(fish.temperament) || 
                 (fish.schooling && values.includes('schooling')) ||
                 (fish.incompatibleTags?.some(tag => values.includes(tag)));
        }
        return false;
      });
      
      // Поиск по зоне
      const zoneMap: Record<string, string> = {
        'верх': 'top',
        'верхний': 'top',
        'середина': 'middle',
        'средний': 'middle',
        'дно': 'bottom',
        'нижний': 'bottom',
      };
      const searchInZone = Object.entries(zoneMap).some(([key, zone]) => {
        return query.includes(key) && fish.zone === zone;
      });
      
      matchesSearch = searchInName || searchInDescription || searchInFamily || 
                     searchInTags || searchInTemperament || searchInZone;
    }
    
    const matchesZone = zoneFilter === 'all' || fish.zone === zoneFilter;
    // Фильтр по уровню опыта отключен - показываем все рыбы
    const matchesLevel = true;
    
    // Фильтрация по параметрам воды
    let matchesWaterParams = true;
    if (fish.waterParams) {
      // Проверка pH
      if (phMinFilter !== undefined || phMaxFilter !== undefined) {
        const fishPhMin = fish.waterParams.phMin;
        const fishPhMax = fish.waterParams.phMax;
        
        if (fishPhMin !== undefined && fishPhMax !== undefined) {
          // Рыба подходит, если её диапазон pH пересекается с фильтром
          const filterMin = phMinFilter ?? 4;
          const filterMax = phMaxFilter ?? 9;
          const overlaps = !(fishPhMax < filterMin || fishPhMin > filterMax);
          matchesWaterParams = matchesWaterParams && overlaps;
        } else {
          // Если у рыбы нет данных о pH, она не проходит фильтр
          matchesWaterParams = false;
        }
      }
      
      // Проверка температуры
      if (tempMinFilter !== undefined || tempMaxFilter !== undefined) {
        const fishTempMin = fish.waterParams.tempMin;
        const fishTempMax = fish.waterParams.tempMax;
        
        if (fishTempMin !== undefined && fishTempMax !== undefined) {
          // Рыба подходит, если её диапазон температуры пересекается с фильтром
          const filterMin = tempMinFilter ?? 10;
          const filterMax = tempMaxFilter ?? 35;
          const overlaps = !(fishTempMax < filterMin || fishTempMin > filterMax);
          matchesWaterParams = matchesWaterParams && overlaps;
        } else {
          // Если у рыбы нет данных о температуре, она не проходит фильтр
          matchesWaterParams = false;
        }
      }
    } else {
      // Если у рыбы нет параметров воды, но фильтр активен - не показываем
      if (phMinFilter !== undefined || phMaxFilter !== undefined || 
          tempMinFilter !== undefined || tempMaxFilter !== undefined) {
        matchesWaterParams = false;
      }
      // Если фильтры не установлены, показываем рыбу даже без параметров воды
    }
    
    return matchesSearch && matchesZone && matchesLevel && matchesWaterParams;
  });

  const isSelected = (fishId: string) => config.selectedFish.some(f => f.fish.id === fishId);

  const handleAddFish = (fish: Fish, count: number) => {
    onAddFish({ fish, count });
    setSelectedFish(null);
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold mb-1 text-foreground">Выберите обитателей</h3>
        <p className="text-xs text-muted-foreground">
          Подберите рыб и креветок для вашего аквариума
        </p>
      </div>

      {/* Catalog type switcher - compact */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: 'freshwater', name: 'Общий' },
          { id: 'planted', name: 'Травник' },
          { id: 'pseudomarine', name: 'Псевдоморе' },
          { id: 'shrimp', name: 'Креветочник' },
          { id: 'cichlid', name: 'Цихлидник' },
          { id: 'marine', name: 'Морской' },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setCatalogType(type.id as typeof config.type)}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
              catalogType === type.id
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Search and filters - compact */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 rounded-lg bg-card/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:shadow-glow transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-card/50 flex items-center justify-center hover:bg-card transition-colors"
              >
                <X className="w-2.5 h-2.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {['all', 'top', 'middle', 'bottom'].map((zone) => (
            <button
              key={zone}
              onClick={() => setZoneFilter(zone)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                zoneFilter === zone
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
              }`}
            >
              {zone === 'all' ? 'Все' : zone === 'top' ? 'Верх' : zone === 'middle' ? 'Середина' : 'Дно'}
            </button>
          ))}
          
          <WaterParamsFilter
            phMin={phMinFilter}
            phMax={phMaxFilter}
            tempMin={tempMinFilter}
            tempMax={tempMaxFilter}
            onPhChange={(min, max) => {
              setPhMinFilter(min);
              setPhMaxFilter(max);
            }}
            onTempChange={(min, max) => {
              setTempMinFilter(min);
              setTempMaxFilter(max);
            }}
            onReset={() => {
              setPhMinFilter(undefined);
              setPhMaxFilter(undefined);
              setTempMinFilter(undefined);
              setTempMaxFilter(undefined);
            }}
          />
        </div>
      </div>

      {/* Main content: Fish list + Details panel */}
      <div className="grid grid-cols-12 gap-3">
        {/* Left: Fish grid */}
        <div className={`col-span-12 ${selectedFish ? 'md:col-span-6' : 'md:col-span-12'} transition-all duration-300`}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
            {filteredFish.map((fish) => (
              <FishCard
                key={fish.id}
                fish={fish}
                selected={isSelected(fish.id)}
                onClick={() => setSelectedFish(fish)}
              />
            ))}
          </div>

          {filteredFish.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">Не найдено подходящих видов</p>
              <p className="text-xs">Попробуйте изменить фильтры</p>
            </div>
          )}

          {/* Family Recommendations - compact */}
          {config.selectedFish.length > 0 && !selectedFish && (
            <FamilyRecommendations
              config={config}
              availableFish={availableFish}
              onFishClick={(fish) => setSelectedFish(fish)}
              isSelected={isSelected}
            />
          )}

          {/* Navigation - compact */}
          <div className="flex justify-between pt-2 border-t border-border/50 mt-3">
            <Button variant="glass" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Назад
            </Button>
            <Button 
              variant="premium" 
              size="sm" 
              onClick={onNext}
              disabled={config.selectedFish.length === 0}
            >
              Далее
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Right: Fish details panel - horizontal slide */}
        <AnimatePresence>
          {selectedFish && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="col-span-12 md:col-span-6"
            >
              <FishModal
                fish={selectedFish}
                config={config}
                onClose={() => setSelectedFish(null)}
                onAdd={handleAddFish}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
