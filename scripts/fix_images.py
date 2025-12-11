#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для исправления проблемы с изображениями рыб
Варианты решения:
1. Поиск изображений через внешние API
2. Улучшенный парсинг с сайта
3. Использование placeholder изображений
"""

import json
import requests
from pathlib import Path
import time

BASE_DIR = Path(__file__).parent.parent
CATALOG_PATH = BASE_DIR / 'fish_catalog.json'
FISH_DB_PATH = BASE_DIR / 'src' / 'data' / 'fishDatabase.ts'

def normalize_fish_name(name):
    """Нормализует название рыбы для поиска"""
    # Убираем лишние слова
    name = name.lower()
    # Убираем слова-модификаторы
    modifiers = ['синие', 'голубые', 'зеленая', 'коричневый', 'бриллиантовый', 'алмазный', 
                 'рыбка', 'аквариумная', 'вишня', 'амано']
    words = name.split()
    words = [w for w in words if w not in modifiers]
    return ' '.join(words[:3])  # Берем первые 3 значимых слова

def search_image_unsplash(query, api_key=None):
    """Поиск изображения через Unsplash API (требует API ключ)"""
    if not api_key:
        return None
    
    try:
        url = "https://api.unsplash.com/search/photos"
        headers = {"Authorization": f"Client-ID {api_key}"}
        params = {"query": query, "per_page": 1}
        
        response = requests.get(url, headers=headers, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('results'):
                return data['results'][0]['urls']['regular']
    except:
        pass
    return None

def search_image_pixabay(query, api_key=None):
    """Поиск изображения через Pixabay API (бесплатный, требует регистрации)"""
    if not api_key:
        return None
    
    try:
        url = "https://pixabay.com/api/"
        params = {
            "key": api_key,
            "q": query,
            "image_type": "photo",
            "category": "animals",
            "per_page": 1
        }
        
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('hits'):
                return data['hits'][0]['webformatURL']
    except:
        pass
    return None

def get_placeholder_image(fish_name):
    """Генерирует URL placeholder изображения"""
    # Можно использовать сервисы типа placeholder.com или создать свои
    return f"https://via.placeholder.com/400x300?text={fish_name.replace(' ', '+')}"

def improve_parser_image_extraction():
    """Улучшенный парсинг изображений - нужно перезапустить парсер с улучшенным кодом"""
    print("""
    Для улучшения парсинга изображений нужно:
    1. Обновить селекторы в fanfishka_parser.py
    2. Добавить поиск изображений в разных местах страницы
    3. Проверять размер изображений (отфильтровывать маленькие)
    4. Перезапустить парсинг
    """)

def solution_1_use_external_api():
    """Решение 1: Использовать внешние API для поиска изображений"""
    print("=" * 60)
    print("РЕШЕНИЕ 1: Поиск изображений через внешние API")
    print("=" * 60)
    print("""
    Преимущества:
    - Высокое качество изображений
    - Автоматический поиск
    
    Недостатки:
    - Требует API ключи (Unsplash, Pixabay)
    - Может быть платным при больших объемах
    - Не всегда точное совпадение
    
    Реализация:
    1. Зарегистрироваться на unsplash.com/developers или pixabay.com/api
    2. Получить API ключ
    3. Использовать функции search_image_unsplash() или search_image_pixabay()
    """)

def solution_2_improve_parser():
    """Решение 2: Улучшить парсер для лучшего извлечения изображений"""
    print("=" * 60)
    print("РЕШЕНИЕ 2: Улучшить парсер")
    print("=" * 60)
    print("""
    Что нужно сделать:
    1. Добавить больше селекторов для поиска изображений
    2. Проверять все <img> теги на странице
    3. Фильтровать по размеру (убирать маленькие иконки)
    4. Проверять data-src, data-lazy-src атрибуты
    5. Перезапустить парсинг
    
    Это лучшее решение, так как дает оригинальные изображения с сайта.
    """)

def solution_3_manual_download():
    """Решение 3: Ручная загрузка изображений"""
    print("=" * 60)
    print("РЕШЕНИЕ 3: Ручная загрузка изображений")
    print("=" * 60)
    print("""
    Процесс:
    1. Открыть статью о рыбе на fanfishka.ru
    2. Сохранить изображение
    3. Поместить в public/fish/
    4. Обновить путь в fishDatabase.ts
    
    Подходит для небольшого количества рыб.
    """)

def solution_4_use_placeholder():
    """Решение 4: Использовать placeholder изображения"""
    print("=" * 60)
    print("РЕШЕНИЕ 4: Placeholder изображения")
    print("=" * 60)
    print("""
    Временное решение:
    - Использовать placeholder сервисы
    - Или создать универсальное изображение рыбы
    - Позже заменить на реальные
    
    Быстро, но не идеально для продакшена.
    """)

def solution_5_hybrid_approach():
    """Решение 5: Гибридный подход (РЕКОМЕНДУЕТСЯ)"""
    print("=" * 60)
    print("РЕШЕНИЕ 5: Гибридный подход (РЕКОМЕНДУЕТСЯ)")
    print("=" * 60)
    print("""
    Комбинация решений:
    
    1. Улучшить парсер (основное решение)
       - Добавить больше селекторов
       - Проверять все изображения на странице
       - Фильтровать по размеру
       
    2. Для рыб без изображений:
       - Использовать поиск по латинскому названию через API
       - Или использовать placeholder
       
    3. Fallback:
       - Если ничего не найдено - использовать дефолтное изображение рыбы
       - Позволить пользователям загружать свои изображения (в будущем)
    
    Это даст максимальный охват и качество.
    """)

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("АНАЛИЗ ПРОБЛЕМЫ С ИЗОБРАЖЕНИЯМИ")
    print("=" * 60 + "\n")
    
    # Анализ текущей ситуации
    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        catalog_data = json.load(f)
    
    total = len(catalog_data)
    bad_images = sum(1 for item in catalog_data 
                    if 'sovmestimost' in item.get('image_url', '').lower())
    good_images = total - bad_images
    
    print(f"Всего записей: {total}")
    print(f"С дефолтным изображением: {bad_images} ({bad_images/total*100:.1f}%)")
    print(f"С нормальным изображением: {good_images} ({good_images/total*100:.1f}%)")
    print()
    
    # Показываем все решения
    solution_1_use_external_api()
    print()
    solution_2_improve_parser()
    print()
    solution_3_manual_download()
    print()
    solution_4_use_placeholder()
    print()
    solution_5_hybrid_approach()
    print()
    
    print("=" * 60)
    print("РЕКОМЕНДАЦИЯ: Начать с улучшения парсера (Решение 2)")
    print("=" * 60)

