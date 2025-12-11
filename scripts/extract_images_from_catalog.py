#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для извлечения главных изображений рыб со страниц КАТАЛОГА
(где видны карточки с фото, как на скриншоте)
"""

import requests
from bs4 import BeautifulSoup
import time
import json
import re
from urllib.parse import urljoin
from pathlib import Path
from typing import Optional, Dict

BASE_DIR = Path(__file__).parent.parent
CATALOG_PATH = BASE_DIR / 'fish_catalog.json'
OUTPUT_PATH = BASE_DIR / 'fish_catalog.json'

BASE_URL = "https://fanfishka.ru"
CATALOG_BASE_URL = "https://fanfishka.ru/akvariumnye-stati/akvariumnye_rybki/page/"
DELAY_BETWEEN_REQUESTS = 1

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def get_page(url: str, retries: int = 3) -> Optional[BeautifulSoup]:
    """Получить страницу с обработкой ошибок"""
    for attempt in range(retries):
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            response.raise_for_status()
            response.encoding = 'utf-8'
            return BeautifulSoup(response.text, 'html.parser')
        except requests.RequestException as e:
            if attempt < retries - 1:
                time.sleep(2)
            else:
                return None
    return None

def extract_fish_images_from_catalog_page(soup: BeautifulSoup, page_url: str) -> Dict[str, str]:
    """
    Извлекает изображения рыб со страницы каталога
    Возвращает словарь: {название_рыбы: url_изображения}
    """
    fish_images = {}
    
    # Ищем все карточки рыб на странице каталога
    # Различные селекторы для карточек
    card_selectors = [
        '.post-box',
        '.article-item',
        '.post-card',
        '.fish-card',
        '.item',
        'article',
        '.entry'
    ]
    
    cards = []
    for selector in card_selectors:
        found_cards = soup.select(selector)
        if found_cards:
            cards = found_cards
            print(f"   Найдено карточек через селектор '{selector}': {len(cards)}")
            break
    
    # Если не нашли через селекторы, ищем по структуре
    if not cards:
        # Ищем все ссылки на статьи о рыбах и их родительские элементы
        fish_links = soup.find_all('a', href=re.compile(r'/akvariumnye-stati/akvariumnye_rybki/'))
        for link in fish_links:
            # Ищем карточку (родительский элемент)
            card = link.find_parent(['article', 'div', 'li'])
            if card and card not in cards:
                cards.append(card)
    
    print(f"   Всего найдено карточек: {len(cards)}")
    
    # Для каждой карточки извлекаем название и изображение
    for card in cards:
        # Ищем название рыбы (обычно в заголовке или ссылке)
        title_elem = card.select_one('h2, h3, h4, .title, .entry-title, .post-title, a')
        if not title_elem:
            continue
        
        fish_name = title_elem.get_text(strip=True)
        
        # Пропускаем не-рыбы
        if any(kw in fish_name.lower() for kw in ['растени', 'оборудован', 'список всех', 'каталог']):
            continue
        
        # Ищем изображение в карточке
        img = card.select_one('img')
        if img:
            img_src = (img.get('src') or 
                      img.get('data-src') or 
                      img.get('data-lazy-src') or
                      img.get('data-original') or
                      img.get('data-url'))
            
            if img_src:
                img_src = urljoin(BASE_URL, img_src)
                
                # Пропускаем дефолтные и баннеры
                skip_patterns = [
                    'sovmestimost_akvaryb.png',
                    'баннер', 'banner', 'navigator',
                    'logo', 'icon', 'avatar', 'thumb', 'widget'
                ]
                
                if not any(skip in img_src.lower() for skip in skip_patterns):
                    # Проверяем размер
                    width = img.get('width') or img.get('data-width') or '0'
                    try:
                        w = int(str(width).replace('px', ''))
                        if w > 150:  # Только достаточно большие изображения
                            fish_images[fish_name] = img_src
                            print(f"      ✓ {fish_name[:30]}: {img_src[:50]}...")
                    except:
                        # Если размер не указан, но это не дефолтное - берем
                        fish_images[fish_name] = img_src
                        print(f"      ✓ {fish_name[:30]}: {img_src[:50]}...")
    
    return fish_images

def normalize_name(name: str) -> str:
    """Нормализует название для сравнения"""
    return re.sub(r'[^\w\s]', '', name.lower().strip())

def main():
    print("=" * 60)
    print("ИЗВЛЕЧЕНИЕ ГЛАВНЫХ ИЗОБРАЖЕНИЙ СО СТРАНИЦ КАТАЛОГА")
    print("=" * 60)
    print()
    
    # Читаем существующий каталог
    print("📖 Чтение каталога...")
    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        catalog_data = json.load(f)
    
    print(f"✅ Загружено {len(catalog_data)} записей")
    
    # Фильтруем только статьи о рыбах
    fish_articles = [
        item for item in catalog_data 
        if (item.get('size_cm', 0) > 0 or item.get('min_tank_liters', 0) > 0) and
           not any(kw in item.get('name_ru', '').lower() for kw in ['растени', 'оборудован', 'список'])
    ]
    print(f"✅ Найдено {len(fish_articles)} статей о рыбах")
    
    # Создаем словарь для быстрого поиска по нормализованному названию
    catalog_dict = {item['id']: item for item in catalog_data}
    fish_name_map = {normalize_name(item['name_ru']): item['id'] for item in fish_articles}
    
    print(f"\n🔄 Парсинг страниц каталога для извлечения изображений...")
    print()
    
    # Определяем количество страниц
    first_page = get_page(f"{CATALOG_BASE_URL}1/")
    if not first_page:
        print("❌ Не удалось загрузить первую страницу каталога")
        return
    
    # Ищем последнюю страницу
    last_page = 1
    pagination_links = first_page.find_all('a', href=re.compile(r'/page/\d+/'))
    for link in pagination_links:
        href = link.get('href', '')
        match = re.search(r'/page/(\d+)/', href)
        if match:
            last_page = max(last_page, int(match.group(1)))
    
    print(f"📄 Найдено страниц каталога: {last_page}")
    print()
    
    total_updated = 0
    
    # Парсим каждую страницу каталога
    for page_num in range(1, min(last_page + 1, 40)):  # Ограничиваем 40 страницами для теста
        print(f"[Страница {page_num}/{last_page}] Парсинг...")
        
        page_url = f"{CATALOG_BASE_URL}{page_num}/"
        soup = get_page(page_url)
        
        if not soup:
            print(f"   ⚠ Не удалось загрузить страницу")
            continue
        
        # Извлекаем изображения со страницы
        fish_images = extract_fish_images_from_catalog_page(soup, page_url)
        
        # Обновляем каталог
        for fish_name, image_url in fish_images.items():
            normalized = normalize_name(fish_name)
            if normalized in fish_name_map:
                fish_id = fish_name_map[normalized]
                if fish_id in catalog_dict:
                    old_image = catalog_dict[fish_id].get('image_url', '')
                    # Обновляем только если старое изображение дефолтное или баннер
                    if ('sovmestimost' in old_image.lower() or 
                        'баннер' in old_image.lower() or 
                        'banner' in old_image.lower() or
                        not old_image):
                        catalog_dict[fish_id]['image_url'] = image_url
                        total_updated += 1
                        print(f"   ✅ Обновлено: {catalog_dict[fish_id]['name_ru'][:30]}")
        
        # Промежуточное сохранение каждые 10 страниц
        if page_num % 10 == 0:
            with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
                json.dump(list(catalog_dict.values()), f, ensure_ascii=False, indent=2)
            print(f"\n💾 Промежуточное сохранение ({page_num} страниц обработано)\n")
        
        time.sleep(DELAY_BETWEEN_REQUESTS)
    
    # Сохраняем обновленный каталог
    print(f"\n💾 Сохранение результатов...")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(list(catalog_dict.values()), f, ensure_ascii=False, indent=2)
    
    print()
    print("=" * 60)
    print("РЕЗУЛЬТАТЫ")
    print("=" * 60)
    print(f"✅ Обновлено изображений: {total_updated}")
    print(f"📁 Результат сохранен в: {OUTPUT_PATH}")
    print()
    print("✨ Готово!")

if __name__ == "__main__":
    main()

