// Скрипт для проверки морских рыб в базе
const freshwaterSpecies = require('../src/data/freshwater_species.json');
const marineSpecies = require('../src/data/marine_species.json');

console.log('=== СТАТИСТИКА БАЗЫ ===\n');
console.log('📊 В JSON файлах:');
console.log(`   Пресноводных: ${freshwaterSpecies.length}`);
console.log(`   Морских: ${marineSpecies.length}`);
console.log(`   Всего: ${freshwaterSpecies.length + marineSpecies.length}\n`);

console.log('🐠 Морские рыбы в JSON:');
marineSpecies.forEach((f, i) => {
  console.log(`   ${i + 1}. ${f.name_ru} (${f.name_lat})`);
  console.log(`      ID: ${f.id}, Тип: ${f.type}, Объём: ${f.min_tank_liters}L`);
});

console.log('\n=== ПРОВЕРКА КОНВЕРТАЦИИ ===');
console.log('Типы в JSON:', [...new Set([...freshwaterSpecies.map(f => f.type), ...marineSpecies.map(f => f.type)])]);

// Симуляция конвертации
const convertAquariumType = (type) => {
  if (type === 'saltwater' || type === 'marine') return 'marine';
  return 'freshwater';
};

const getCompatibleTypes = (type, reefSafe) => {
  const aquariumType = convertAquariumType(type);
  const types = [aquariumType];
  if (aquariumType === 'freshwater' && reefSafe) {
    types.push('planted');
  }
  return types;
};

console.log('\n🔍 После конвертации типов:');
marineSpecies.forEach(f => {
  const convertedType = convertAquariumType(f.type);
  const compatibleTypes = getCompatibleTypes(f.type, f.reef_safe);
  console.log(`   ${f.name_ru}: ${f.type} → ${convertedType}, compatibleTypes: [${compatibleTypes.join(', ')}]`);
});

console.log('\n✅ Все морские рыбы должны иметь compatibleTypes: ["marine"]');
