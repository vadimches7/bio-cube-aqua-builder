import { useState } from 'react';
import { motion } from 'framer-motion';
import { AquariumConfig, SelectedFish, Fish } from '@/types/aquarium';
import { getFishByType } from '@/data/fishDatabase';
import { Button } from '@/components/ui/button';
import { FishCard } from './FishCard';
import { FishModal } from './FishModal';
import { ArrowLeft, ArrowRight, Search, Filter } from 'lucide-react';

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

  const availableFish = getFishByType(config.type);
  
  const filteredFish = availableFish.filter(fish => {
    const matchesSearch = fish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fish.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = zoneFilter === 'all' || fish.zone === zoneFilter;
    const matchesLevel = config.experienceLevel === 'advanced' || 
                        (config.experienceLevel === 'intermediate' && fish.difficulty !== 'advanced') ||
                        (config.experienceLevel === 'beginner' && fish.difficulty === 'beginner');
    return matchesSearch && matchesZone && matchesLevel;
  });

  const isSelected = (fishId: string) => config.selectedFish.some(f => f.fish.id === fishId);

  const handleAddFish = (fish: Fish, count: number) => {
    onAddFish({ fish, count });
    setSelectedFish(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">Выберите обитателей</h3>
        <p className="text-muted-foreground">
          Подберите рыб и креветок для вашего аквариума. Показаны виды, подходящие для "{config.type}".
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:shadow-glow transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'top', 'middle', 'bottom'].map((zone) => (
            <button
              key={zone}
              onClick={() => setZoneFilter(zone)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                zoneFilter === zone
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
              }`}
            >
              {zone === 'all' ? 'Все' : zone === 'top' ? 'Верх' : zone === 'middle' ? 'Середина' : 'Дно'}
            </button>
          ))}
        </div>
      </div>

      {/* Fish grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
        {filteredFish.map((fish, index) => (
          <motion.div
            key={fish.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <FishCard
              fish={fish}
              selected={isSelected(fish.id)}
              onClick={() => setSelectedFish(fish)}
            />
          </motion.div>
        ))}
      </div>

      {filteredFish.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Не найдено подходящих видов</p>
          <p className="text-sm">Попробуйте изменить фильтры или уровень опыта</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border/50">
        <Button variant="glass" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Назад
        </Button>
        <Button 
          variant="premium" 
          size="lg" 
          onClick={onNext}
          disabled={config.selectedFish.length === 0}
        >
          Получить проект
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Fish detail modal */}
      {selectedFish && (
        <FishModal
          fish={selectedFish}
          config={config}
          onClose={() => setSelectedFish(null)}
          onAdd={handleAddFish}
        />
      )}
    </div>
  );
};
