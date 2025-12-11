#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для обновления изображений и описаний рыб из спарсенных данных
"""

import json
import re
import os
from pathlib import Path

# Пути к файлам
BASE_DIR = Path(__file__).parent.parent
CATALOG_PATH = BASE_DIR / 'fish_catalog.json'
FISH_DB_PATH = BASE_DIR / 'src' / 'data' / 'fishDatabase.ts'

print('📖 Чтение данных...')

# Читаем спарсенные данные
with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
    catalog_data = json.load(f)

# Читаем файл базы данных
with open(FISH_DB_PATH, 'r', encoding='utf-8') as f:
    fish_db_content = f.read()

print(f'✅ Найдено {len(catalog_data)} записей в каталоге')

# Извлекаем список рыб из BASE_FISH_DATABASE
fish_matches = []
# Паттерн для поиска рыб: id, name, nameEn
pattern = r"id:\s*['\"]([^'\"]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"],\s*nameEn:\s*['\"]([^'\"]+)['\"]"

for match in re.finditer(pattern, fish_db_content):
    fish_matches.append({
        'id': match.group(1),
        'name': match.group(2),
        'nameEn': match.group(3),
        'start': match.start(),
        'end': match.end(),
    })

print(f'✅ Найдено {len(fish_matches)} рыб в базе данных')

# Функция для нормализации названий
def normalize_name(name):
    """Нормализует название для сравнения"""
    if not name:
        return ''
    return re.sub(r'[.,;:!?]', '', name.lower().strip().replace('\s+', ' '))

# Функция для поиска совпадений
def find_match(fish, catalog):
    """Находит совпадение рыбы в каталоге"""
    fish_name_norm = normalize_name(fish['name'])
    fish_name_en_norm = normalize_name(fish['nameEn'])
    
    for item in catalog:
        # Пропускаем не-рыбы (растения, оборудование)
        if not item.get('name_ru') or 'растени' in item.get('name_ru', '').lower():
            continue
            
        item_name_norm = normalize_name(item.get('name_ru', ''))
        item_name_lat_norm = normalize_name(item.get('name_lat', ''))
        
        # Точное совпадение русского названия
        if item_name_norm and fish_name_norm and item_name_norm == fish_name_norm:
            return item
        
        # Точное совпадение латинского названия
        if item_name_lat_norm and fish_name_en_norm and item_name_lat_norm == fish_name_en_norm:
            return item
        
        # Частичное совпадение по ключевым словам
        fish_keywords = [w for w in fish_name_norm.split() if len(w) > 3]
        item_keywords = [w for w in item_name_norm.split() if len(w) > 3]
        
        if fish_keywords and item_keywords:
            common = set(fish_keywords) & set(item_keywords)
            if len(common) >= min(len(fish_keywords), len(item_keywords)) * 0.7:
                return item
    
    return None

# Сопоставляем рыбы
updates = []
not_found = []

# Специальные сопоставления для сложных случаев
special_matches = {
    'neon-tetra': ['неон', 'neon'],
    'guppy': ['гуппи', 'guppy'],
    'angelfish': ['скалярия', 'angelfish', 'pterophyllum'],
    'corydoras': ['коридорас', 'corydoras'],
    'betta': ['петушок', 'betta', 'бойцов'],
    'discus': ['дискус', 'discus'],
    'pleco': ['плеко', 'pleco', 'анциструс'],
}

for fish in fish_matches:
    match = None
    
    # Сначала пробуем специальные сопоставления
    if fish['id'] in special_matches:
        keywords = special_matches[fish['id']]
        for item in catalog_data:
            item_name_lower = normalize_name(item.get('name_ru', ''))
            if any(kw in item_name_lower for kw in keywords):
                match = item
                break
    
    # Если не нашли, используем обычный поиск
    if not match:
        match = find_match(fish, catalog_data)
    
    if match:
        updates.append({
            'fish': fish,
            'catalog_item': match,
        })
        print(f'✅ Найдено: {fish["name"]} ↔ {match.get("name_ru", "N/A")}')
    else:
        not_found.append(fish)
        print(f'❌ Не найдено: {fish["name"]}')

print(f'\n📊 Статистика:')
print(f'   Найдено совпадений: {len(updates)}')
print(f'   Не найдено: {len(not_found)}')

# Обновляем файл
updated_content = fish_db_content
backup_path = str(FISH_DB_PATH) + '.backup'

# Создаем бэкап
with open(backup_path, 'w', encoding='utf-8') as f:
    f.write(fish_db_content)
print(f'\n💾 Создан бэкап: {backup_path}')

# Обновляем каждую рыбу
for update in updates:
    fish = update['fish']
    catalog_item = update['catalog_item']
    
    # Обновляем описание
    if catalog_item.get('description_short'):
        description = catalog_item['description_short']
        # Очищаем от лишних символов
        description = re.sub(r'\n+', ' ', description)
        description = re.sub(r'\s+', ' ', description).strip()
        
        # Убираем дубликаты названия в начале
        fish_name = fish['name']
        if description.lower().startswith(fish_name.lower()):
            # Убираем название и повторяющиеся слова
            description = description[len(fish_name):].strip()
            # Убираем повторяющиеся слова в начале
            words = description.split()
            if len(words) > 3:
                # Проверяем, не повторяется ли начало
                first_words = ' '.join(words[:3]).lower()
                if first_words in fish_name.lower() or fish_name.lower() in first_words:
                    description = ' '.join(words[3:])
        
        # Берем первые 300 символов
        if len(description) > 300:
            description = description[:300] + '...'
        
        # Экранируем кавычки и обратные слеши
        description = description.replace("\\", "\\\\").replace("'", "\\'")
        
        # Ищем блок с этой рыбой (от id до следующей запятой или закрывающей скобки)
        fish_block_pattern = rf"(id:\s*['\"]{re.escape(fish['id'])}['\"][^}}]*?description:\s*['\"])([^'\"]*?)(['\"])"
        
        def replace_desc(m):
            return m.group(1) + description + m.group(3)
        
        updated_content = re.sub(fish_block_pattern, replace_desc, updated_content, flags=re.DOTALL)
        print(f'   ✓ Обновлено описание для {fish["name"]}')
    
    # Обновляем изображение
    image_url = catalog_item.get('image_url', '')
    if image_url and 'sovmestimost_akvaryb.png' not in image_url:
        # Находим начало блока с этой рыбой
        fish_id_pattern = rf"id:\s*['\"]{re.escape(fish['id'])}['\"]"
        match_start = re.search(fish_id_pattern, updated_content)
        
        if match_start:
            # Находим конец блока (следующая запись или закрывающая скобка)
            start_pos = match_start.start()
            # Ищем image: в этом блоке
            block_end = updated_content.find('},', start_pos)
            if block_end == -1:
                block_end = updated_content.find('}', start_pos)
            
            if block_end > start_pos:
                block = updated_content[start_pos:block_end]
                # Ищем image в этом блоке
                image_pattern = r"(image:\s*['\"])([^'\"]*)(['\"])"
                image_match = re.search(image_pattern, block)
                
                if image_match:
                    # Заменяем изображение
                    old_image = image_match.group(2)
                    new_block = block[:image_match.start()] + image_match.group(1) + image_url + image_match.group(3) + block[image_match.end():]
                    updated_content = updated_content[:start_pos] + new_block + updated_content[block_end:]
                    print(f'   ✓ Обновлено изображение для {fish["name"]}: {image_url[:60]}...')
                else:
                    print(f'   ⚠ Не найден паттерн image в блоке {fish["name"]}')
            else:
                print(f'   ⚠ Не найден конец блока для {fish["name"]}')
        else:
            print(f'   ⚠ Не найден блок с id {fish["id"]}')

# Сохраняем обновленный файл
with open(FISH_DB_PATH, 'w', encoding='utf-8') as f:
    f.write(updated_content)
print(f'\n✅ Файл обновлен: {FISH_DB_PATH}')

# Сохраняем отчет
report = {
    'total': len(fish_matches),
    'found': len(updates),
    'not_found': [{'id': f['id'], 'name': f['name'], 'nameEn': f['nameEn']} for f in not_found],
    'updates': [
        {
            'fishId': u['fish']['id'],
            'fishName': u['fish']['name'],
            'catalogName': u['catalog_item'].get('name_ru', 'N/A'),
            'hasImage': bool(u['catalog_item'].get('image_url')),
            'hasDescription': bool(u['catalog_item'].get('description_short')),
        }
        for u in updates
    ],
}

report_path = BASE_DIR / 'scripts' / 'update_report.json'
with open(report_path, 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)
print(f'📄 Отчет сохранен: {report_path}')

print(f'\n✨ Готово! Обновлено {len(updates)} из {len(fish_matches)} рыб')

