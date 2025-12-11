#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для перепарсинга только изображений из уже собранных статей о рыбах
"""

import requests
from bs4 import BeautifulSoup
import time
import json
import re
from urllib.parse import urljoin
from pathlib import Path
from typing import Optional

BASE_DIR = Path(__file__).parent.parent
CATALOG_PATH = BASE_DIR / 'fish_catalog.json'
OUTPUT_PATH = BASE_DIR / 'fish_catalog_updated.json'

BASE_URL = "https://fanfishka.ru"
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
            print(f"⚠ Ошибка при запросе {url} (попытка {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                time.sleep(2)
            else:
                print(f"❌ Не удалось загрузить {url}")
                return None
    return None

def extract_image_from_page(soup: BeautifulSoup, article_url: str) -> Optional[str]:
    """Извлечь изображение рыбы со страницы (улучшенная версия)"""
    image_url = None
    
    # Стратегия 1: Ищем в контейнерах контента
    content_containers = [
        '.entry-content',
        '.post-content',
        '.article-content',
        '.content',
        'article',
        '.post-body',
        '.single-post',
        'main article',
        '.article-body'
    ]
    
    for container_selector in content_containers:
        container = soup.select_one(container_selector)
        if container:
            images = container.find_all('img')
            for img in images:
                img_src = (img.get('src') or 
                          img.get('data-src') or 
                          img.get('data-lazy-src') or
                          img.get('data-original') or
                          img.get('data-url'))
                
                if img_src:
                    img_src = urljoin(BASE_URL, img_src)
                    
                    # Пропускаем дефолтные изображения
                    if 'sovmestimost_akvaryb.png' in img_src.lower():
                        continue
                    
                    # Пропускаем иконки и логотипы
                    skip_patterns = [
                        'logo', 'icon', 'avatar', 'banner', 'thumb', 
                        'thumbnail', 'wp-', 'emoji', 'button', 'arrow',
                        'social', 'share', 'comment'
                    ]
                    if any(skip in img_src.lower() for skip in skip_patterns):
                        continue
                    
                    # Проверяем размер (если указан)
                    width = img.get('width') or img.get('data-width') or '0'
                    try:
                        w = int(str(width).replace('px', ''))
                        if w > 200:  # Только большие изображения
                            image_url = img_src
                            break
                    except:
                        # Если размер не указан, проверяем по имени файла
                        # Если это не дефолтное - берем
                        if 'sovmestimost' not in img_src.lower():
                            image_url = img_src
                            break
            
            if image_url:
                break
    
    # Стратегия 2: Если не нашли, ищем все изображения и берем самое большое
    if not image_url:
        all_images = soup.find_all('img')
        candidate_images = []
        
        for img in all_images:
            img_src = (img.get('src') or 
                      img.get('data-src') or 
                      img.get('data-lazy-src') or
                      img.get('data-original'))
            
            if img_src:
                img_src = urljoin(BASE_URL, img_src)
                
                # Пропускаем дефолтные
                if 'sovmestimost' in img_src.lower():
                    continue
                
                # Пропускаем иконки
                skip_patterns = ['logo', 'icon', 'avatar', 'banner', 'thumb', 'wp-admin', 'social']
                if any(skip in img_src.lower() for skip in skip_patterns):
                    continue
                
                # Получаем размер
                width = img.get('width') or img.get('data-width') or '0'
                height = img.get('height') or img.get('data-height') or '0'
                
                try:
                    w = int(str(width).replace('px', '')) if width else 0
                    h = int(str(height).replace('px', '')) if height else 0
                    size = w * h if w > 0 and h > 0 else 1000
                    candidate_images.append((size, img_src))
                except:
                    candidate_images.append((1000, img_src))
        
        # Сортируем по размеру и берем самое большое
        if candidate_images:
            candidate_images.sort(reverse=True, key=lambda x: x[0])
            image_url = candidate_images[0][1]
    
    return image_url

def is_fish_article(item: dict) -> bool:
    """Проверяет, является ли статья о рыбе (а не о растении или оборудовании)"""
    name = item.get('name_ru', '').lower()
    
    # Исключаем не-рыбы
    exclude_keywords = [
        'растени', 'оборудован', 'фильтр', 'обогревател', 'компрессор',
        'освещен', 'грунт', 'декор', 'корм', 'лечен', 'болезн',
        'список всех', 'каталог', 'обзор', 'стать', 'совместимост'
    ]
    
    if any(keyword in name for keyword in exclude_keywords):
        return False
    
    # Проверяем наличие параметров рыбы
    has_fish_params = (
        item.get('size_cm', 0) > 0 or
        item.get('min_tank_liters', 0) > 0 or
        item.get('water_params', {}).get('temp_min') is not None
    )
    
    return has_fish_params

def main():
    print("=" * 60)
    print("ПЕРЕПАРСИНГ ИЗОБРАЖЕНИЙ ДЛЯ АКВАРИУМНЫХ РЫБ")
    print("=" * 60)
    print()
    
    # Читаем существующий каталог
    print("📖 Чтение каталога...")
    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        catalog_data = json.load(f)
    
    print(f"✅ Загружено {len(catalog_data)} записей")
    
    # Фильтруем только статьи о рыбах
    fish_articles = [item for item in catalog_data if is_fish_article(item)]
    print(f"✅ Найдено {len(fish_articles)} статей о рыбах")
    
    # Фильтруем те, у которых дефолтное изображение
    articles_to_update = [
        item for item in fish_articles 
        if 'sovmestimost_akvaryb.png' in item.get('image_url', '').lower()
    ]
    print(f"📸 Требуют обновления изображений: {len(articles_to_update)}")
    print()
    
    # Создаем словарь для быстрого поиска
    catalog_dict = {item['id']: item for item in catalog_data}
    
    # Перепарсиваем изображения
    updated_count = 0
    not_found_count = 0
    
    print("🔄 Начало перепарсинга изображений...")
    print()
    
    for i, item in enumerate(articles_to_update, 1):
        # Извлекаем URL статьи из названия или других полей
        # Нужно восстановить URL статьи
        article_id = item.get('id')
        
        # Пробуем найти URL в данных или реконструировать
        # Обычно URL имеет формат: /akvariumnye-stati/akvariumnye_rybki/{id}-{name}.html
        name_slug = item.get('name_ru', '').lower()
        name_slug = re.sub(r'[^\w\s-]', '', name_slug)
        name_slug = re.sub(r'\s+', '-', name_slug)[:50]
        
        # Пробуем несколько вариантов URL
        possible_urls = [
            f"https://fanfishka.ru/akvariumnye-stati/akvariumnye_rybki/{article_id}-{name_slug}.html",
            f"https://fanfishka.ru/akvariumnye-stati/akvariumnye_rybki/{article_id}.html",
        ]
        
        image_found = False
        for url in possible_urls:
            print(f"[{i}/{len(articles_to_update)}] Проверка: {item.get('name_ru', 'N/A')[:40]}...")
            
            soup = get_page(url)
            if soup:
                new_image = extract_image_from_page(soup, url)
                if new_image and 'sovmestimost' not in new_image.lower():
                    catalog_dict[article_id]['image_url'] = new_image
                    updated_count += 1
                    print(f"   ✅ Найдено изображение: {new_image[:60]}...")
                    image_found = True
                    break
            
            time.sleep(DELAY_BETWEEN_REQUESTS)
        
        if not image_found:
            not_found_count += 1
            print(f"   ❌ Изображение не найдено")
        
        # Промежуточное сохранение каждые 50 статей
        if i % 50 == 0:
            with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
                json.dump(list(catalog_dict.values()), f, ensure_ascii=False, indent=2)
            print(f"\n💾 Промежуточное сохранение ({i} статей обработано)\n")
    
    # Сохраняем обновленный каталог
    print(f"\n💾 Сохранение результатов...")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(list(catalog_dict.values()), f, ensure_ascii=False, indent=2)
    
    print()
    print("=" * 60)
    print("РЕЗУЛЬТАТЫ")
    print("=" * 60)
    print(f"✅ Обновлено изображений: {updated_count}")
    print(f"❌ Не найдено: {not_found_count}")
    print(f"📁 Результат сохранен в: {OUTPUT_PATH}")
    print()
    print("✨ Готово!")

if __name__ == "__main__":
    main()

