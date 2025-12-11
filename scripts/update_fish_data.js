#!/usr/bin/env node
/**
 * Скрипт для обновления изображений и описаний рыб из спарсенных данных
 */

const fs = require('fs');
const path = require('path');

// Читаем спарсенные данные
const catalogPath = path.join(__dirname, '..', 'fish_catalog.json');
const fishDbPath = path.join(__dirname, '..', 'src', 'data', 'fishDatabase.ts');

console.log('📖 Чтение данных...');

const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const fishDbContent = fs.readFileSync(fishDbPath, 'utf-8');

// Извлекаем список рыб из BASE_FISH_DATABASE
const fishMatches = [];
const fishPattern = /id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],\s*nameEn:\s*['"]([^'"]+)['"]/g;
let match;

while ((match = fishPattern.exec(fishDbContent)) !== null) {
  fishMatches.push({
    id: match[1],
    name: match[2],
    nameEn: match[3],
    fullMatch: match[0],
    index: match.index,
  });
}

console.log(`✅ Найдено ${fishMatches.length} рыб в базе данных`);
console.log(`✅ Найдено ${catalogData.length} записей в каталоге`);

// Функция для нормализации названий (убираем лишние пробелы, приводим к нижнему регистру)
function normalizeName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,;:!?]/g, '');
}

// Функция для поиска совпадений
function findMatch(fish, catalog) {
  const fishNameNorm = normalizeName(fish.name);
  const fishNameEnNorm = normalizeName(fish.nameEn);

  for (const item of catalog) {
    const itemNameNorm = normalizeName(item.name_ru || '');
    const itemNameLatNorm = normalizeName(item.name_lat || '');

    // Точное совпадение русского названия
    if (itemNameNorm === fishNameNorm) {
      return item;
    }

    // Точное совпадение латинского названия
    if (itemNameLatNorm && fishNameEnNorm && itemNameLatNorm === fishNameEnNorm) {
      return item;
    }

    // Частичное совпадение (если название содержит ключевые слова)
    const fishKeywords = fishNameNorm.split(/\s+/).filter(w => w.length > 3);
    const itemKeywords = itemNameNorm.split(/\s+/).filter(w => w.length > 3);
    
    if (fishKeywords.length > 0 && itemKeywords.length > 0) {
      const commonKeywords = fishKeywords.filter(k => itemKeywords.includes(k));
      if (commonKeywords.length >= Math.min(fishKeywords.length, itemKeywords.length) * 0.7) {
        return item;
      }
    }
  }

  return null;
}

// Сопоставляем рыбы
const updates = [];
const notFound = [];

for (const fish of fishMatches) {
  const match = findMatch(fish, catalogData);
  
  if (match) {
    updates.push({
      fish,
      catalogItem: match,
    });
    console.log(`✅ Найдено совпадение: ${fish.name} ↔ ${match.name_ru}`);
  } else {
    notFound.push(fish);
    console.log(`❌ Не найдено: ${fish.name}`);
  }
}

console.log(`\n📊 Статистика:`);
console.log(`   Найдено совпадений: ${updates.length}`);
console.log(`   Не найдено: ${notFound.length}`);

// Обновляем файл fishDatabase.ts
let updatedContent = fishDbContent;

for (const { fish, catalogItem } of updates) {
  // Обновляем описание
  if (catalogItem.description_short) {
    // Очищаем описание от лишних символов и ограничиваем длину
    let description = catalogItem.description_short
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Берем первые 300 символов
    if (description.length > 300) {
      description = description.substring(0, 300) + '...';
    }

    // Ищем и заменяем описание
    const descPattern = new RegExp(
      `(id:\\s*['"]${fish.id}['"][^}]*description:\\s*['"])([^'"]*)(['"])`,
      's'
    );
    
    if (descPattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(
        descPattern,
        `$1${description.replace(/'/g, "\\'")}$3`
      );
      console.log(`   ✓ Обновлено описание для ${fish.name}`);
    }
  }

  // Обновляем изображение (если есть image_url)
  if (catalogItem.image_url && catalogItem.image_url !== 'https://fanfishka.ru/FotoluchirStati/sovmestimost_akvaryb.png') {
    // Извлекаем имя файла из URL или используем оригинальный URL
    let imagePath = catalogItem.image_url;
    
    // Если это внешний URL, оставляем как есть (или можно скачать и сохранить локально)
    // Для простоты оставляем внешний URL
    const imagePattern = new RegExp(
      `(id:\\s*['"]${fish.id}['"][^}]*image:\\s*['"])([^'"]*)(['"])`,
      's'
    );
    
    if (imagePattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(
        imagePattern,
        `$1${imagePath}$3`
      );
      console.log(`   ✓ Обновлено изображение для ${fish.name}`);
    }
  }
}

// Сохраняем обновленный файл
const backupPath = fishDbPath + '.backup';
fs.writeFileSync(backupPath, fishDbContent);
console.log(`\n💾 Создан бэкап: ${backupPath}`);

fs.writeFileSync(fishDbPath, updatedContent);
console.log(`✅ Файл обновлен: ${fishDbPath}`);

// Сохраняем отчет
const report = {
  total: fishMatches.length,
  found: updates.length,
  notFound: notFound.map(f => ({ id: f.id, name: f.name, nameEn: f.nameEn })),
  updates: updates.map(({ fish, catalogItem }) => ({
    fishId: fish.id,
    fishName: fish.name,
    catalogName: catalogItem.name_ru,
    hasImage: !!catalogItem.image_url,
    hasDescription: !!catalogItem.description_short,
  })),
};

const reportPath = path.join(__dirname, '..', 'scripts', 'update_report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 Отчет сохранен: ${reportPath}`);

console.log(`\n✨ Готово! Обновлено ${updates.length} из ${fishMatches.length} рыб`);

