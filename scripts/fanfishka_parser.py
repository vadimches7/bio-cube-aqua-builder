#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для парсинга каталога аквариумных рыбок с сайта fanfishka.ru
"""

import requests
from bs4 import BeautifulSoup
import time
import json
import re
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Optional
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Константы
BASE_URL = "https://fanfishka.ru"
START_URL = "https://fanfishka.ru/akvariumnye-stati/akvariumnye_rybki/page/1/"
DELAY_BETWEEN_REQUESTS = 1  # секунды
OUTPUT_FILE = "fish_catalog.json"

# User-Agent для имитации браузера
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}


class FanFishkaParser:
    """Класс для парсинга каталога рыб с fanfishka.ru"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.fish_links = []
        self.fish_data = []
        self.fish_id_counter = 1
    
    def get_page(self, url: str, retries: int = 3) -> Optional[BeautifulSoup]:
        """Получить страницу с обработкой ошибок"""
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=10)
                response.raise_for_status()
                response.encoding = 'utf-8'
                return BeautifulSoup(response.text, 'html.parser')
            except requests.RequestException as e:
                logger.warning(f"Ошибка при запросе {url} (попытка {attempt + 1}/{retries}): {e}")
                if attempt < retries - 1:
                    time.sleep(2)
                else:
                    logger.error(f"Не удалось загрузить {url}")
                    return None
        return None
    
    def find_last_page(self) -> int:
        """Определить номер последней страницы каталога"""
        logger.info("Определение последней страницы каталога...")
        soup = self.get_page(START_URL)
        if not soup:
            return 1
        
        last_page = 1
        page_numbers = []
        
        # Вариант 1: Поиск по классам пагинации
        pagination_selectors = [
            '.pagination a',
            '.page-numbers a',
            '.pager a',
            '.pagination-nav a',
            'nav.pagination a',
            '.wp-pagenavi a',
            '.pagination li a',
            '.page-nav a'
        ]
        
        for selector in pagination_selectors:
            links = soup.select(selector)
            if links:
                for link in links:
                    href = link.get('href', '')
                    text = link.get_text(strip=True)
                    # Извлекаем номер страницы из URL
                    if '/page/' in href:
                        match = re.search(r'/page/(\d+)/', href)
                        if match:
                            page_numbers.append(int(match.group(1)))
                    # Или из текста ссылки
                    elif text.isdigit():
                        try:
                            page_numbers.append(int(text))
                        except ValueError:
                            pass
                
                if page_numbers:
                    last_page = max(page_numbers)
                    logger.info(f"Найдена последняя страница через селектор {selector}: {last_page}")
                    break
        
        # Вариант 2: Универсальный поиск всех ссылок с /page/
        if last_page == 1:
            all_links = soup.find_all('a', href=True)
            for link in all_links:
                href = link.get('href', '')
                if '/page/' in href:
                    match = re.search(r'/page/(\d+)/', href)
                    if match:
                        page_numbers.append(int(match.group(1)))
            
            if page_numbers:
                last_page = max(page_numbers)
                logger.info(f"Найдена последняя страница универсальным поиском: {last_page}")
        
        # Вариант 3: Если не нашли, пробуем инкрементально искать страницы
        if last_page == 1:
            logger.warning("Не удалось определить последнюю страницу автоматически. Пробуем найти вручную...")
            # Пробуем проверить несколько страниц
            for test_page in [2, 3, 5, 10, 20, 50]:
                test_url = f"https://fanfishka.ru/akvariumnye-stati/akvariumnye_rybki/page/{test_page}/"
                test_soup = self.get_page(test_url)
                if test_soup:
                    # Проверяем, есть ли контент на странице
                    content = test_soup.get_text()
                    if len(content) > 1000:  # Если есть достаточно контента
                        last_page = test_page
                        time.sleep(0.5)
                    else:
                        break
                else:
                    break
            
            if last_page > 1:
                logger.info(f"Найдена последняя страница методом проверки: {last_page}")
        
        logger.info(f"Используется последняя страница: {last_page}")
        return max(last_page, 1)
    
    def collect_fish_links_from_page(self, page_url: str) -> List[str]:
        """Собрать все ссылки на статьи о рыбах со страницы каталога"""
        soup = self.get_page(page_url)
        if not soup:
            return []
        
        links = []
        
        # Сначала пробуем специфичные селекторы
        article_selectors = [
            '.post-box a',
            '.article-item a',
            '.post-card a',
            '.entry-title a',
            '.post-title a',
            'article a',
            '.post a',
            '.fish-card a',
            '.item a',
            '.card a',
            'h2 a',
            'h3 a',
            'h4 a'
        ]
        
        found_with_selector = False
        for selector in article_selectors:
            elements = soup.select(selector)
            if elements:
                for element in elements:
                    href = element.get('href', '')
                    if href:
                        # Проверяем различные варианты URL статей
                        if any(pattern in href for pattern in [
                            '/akvariumnye-stati/akvariumnye_rybki/',
                            '/akvariumnye-stati/',
                            '/rybki/',
                            '/fish/'
                        ]) and '/page/' not in href:  # Исключаем ссылки на страницы пагинации
                            full_url = urljoin(BASE_URL, href)
                            if full_url not in links and full_url not in self.fish_links:
                                links.append(full_url)
                
                if links:
                    logger.info(f"Найдено {len(links)} ссылок на странице {page_url} (селектор: {selector})")
                    found_with_selector = True
                    break
        
        # Если не нашли через селекторы, ищем все ссылки на странице
        if not found_with_selector:
            logger.warning(f"Селекторы не сработали, ищем все ссылки на странице...")
            all_links = soup.find_all('a', href=True)
            for link in all_links:
                href = link.get('href', '')
                if href:
                    # Ищем ссылки, которые ведут на статьи о рыбах
                    if any(pattern in href for pattern in [
                        '/akvariumnye-stati/akvariumnye_rybki/',
                        '/akvariumnye-stati/'
                    ]) and '/page/' not in href and href not in ['#', '']:
                        full_url = urljoin(BASE_URL, href)
                        # Проверяем, что это не главная страница каталога
                        if full_url != page_url and full_url not in links and full_url not in self.fish_links:
                            links.append(full_url)
            
            if links:
                logger.info(f"Найдено {len(links)} ссылок универсальным поиском")
            else:
                # Отладочная информация
                logger.warning(f"Не найдено ссылок. Проверяем структуру страницы...")
                # Выводим примеры найденных ссылок для отладки
                sample_links = soup.find_all('a', href=True, limit=10)
                logger.debug(f"Примеры ссылок на странице:")
                for sample in sample_links[:5]:
                    logger.debug(f"  - {sample.get('href', '')}")
        
        return links
    
    def extract_latin_name(self, text: str) -> str:
        """Извлечь латинское название из текста"""
        # Паттерны для поиска латинского названия
        patterns = [
            r'\(([A-Z][a-z]+(?:\s+[a-z]+)+)\)',  # (Paracheirodon innesi)
            r'([A-Z][a-z]+\s+[a-z]+)',  # Paracheirodon innesi
            r'Латинское название[:\s]+([A-Z][a-z]+(?:\s+[a-z]+)+)',
            r'Научное название[:\s]+([A-Z][a-z]+(?:\s+[a-z]+)+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()
        
        return ""
    
    def extract_water_params(self, text: str) -> Dict[str, Optional[float]]:
        """Извлечь параметры воды из текста"""
        params = {
            'ph_min': None,
            'ph_max': None,
            'temp_min': None,
            'temp_max': None
        }
        
        # Поиск pH
        ph_patterns = [
            r'pH[:\s]+([\d,\.]+)[\s\-–—]+([\d,\.]+)',
            r'pH[:\s]+([\d,\.]+)',
            r'кислотность[:\s]+([\d,\.]+)[\s\-–—]+([\d,\.]+)',
        ]
        
        for pattern in ph_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    if len(match.groups()) == 2:
                        params['ph_min'] = float(match.group(1).replace(',', '.'))
                        params['ph_max'] = float(match.group(2).replace(',', '.'))
                    else:
                        ph_value = float(match.group(1).replace(',', '.'))
                        params['ph_min'] = ph_value - 0.5
                        params['ph_max'] = ph_value + 0.5
                    break
                except ValueError:
                    continue
        
        # Поиск температуры
        temp_patterns = [
            r'температур[аы][:\s]+([\d,\.]+)[\s\-–—°]+([\d,\.]+)',
            r'(\d+)[\s\-–—°]+(\d+)\s*°[СC]',
            r'(\d+)[\s\-–—]+(\d+)\s*градус',
        ]
        
        for pattern in temp_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    params['temp_min'] = float(match.group(1).replace(',', '.'))
                    params['temp_max'] = float(match.group(2).replace(',', '.'))
                    break
                except ValueError:
                    continue
        
        return params
    
    def extract_min_volume(self, text: str) -> Optional[int]:
        """Извлечь минимальный объем аквариума"""
        patterns = [
            r'минимальн[ый]+[й\s]+объем[:\s]+(\d+)',
            r'от\s+(\d+)\s+литр',
            r'минимум[:\s]+(\d+)\s+л',
            r'объем[:\s]+(\d+)\s+л',
            r'аквариум[:\s]+(\d+)\s+л',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return int(match.group(1))
                except ValueError:
                    continue
        
        return None
    
    def extract_size(self, text: str) -> Optional[float]:
        """Извлечь размер рыбы в см"""
        patterns = [
            r'размер[:\s]+до\s+(\d+[,\.]?\d*)\s*см',
            r'длина[:\s]+(\d+[,\.]?\d*)\s*см',
            r'(\d+[,\.]?\d*)\s*см\s+в\s+длину',
            r'до\s+(\d+[,\.]?\d*)\s*см',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    size_str = match.group(1).replace(',', '.')
                    return float(size_str)
                except ValueError:
                    continue
        
        return None
    
    def extract_temperament(self, text: str) -> str:
        """Определить темперамент рыбы"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['мирн', 'спокойн', 'peaceful', 'дружелюбн']):
            return "Мирный"
        elif any(word in text_lower for word in ['агрессивн', 'хищн', 'aggressive', 'predator']):
            return "Агрессивный"
        elif any(word in text_lower for word in ['территориальн', 'полуагрессивн', 'semi-aggressive']):
            return "Полуагрессивный"
        
        return "Мирный"  # По умолчанию
    
    def extract_min_group_size(self, text: str) -> int:
        """Определить минимальный размер стаи"""
        patterns = [
            r'стайн[ая]+[й\s]+(\d+)',
            r'групп[аы][:\s]+от\s+(\d+)',
            r'минимум[:\s]+(\d+)\s+особ',
            r'содержать[:\s]+от\s+(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return int(match.group(1))
                except ValueError:
                    continue
        
        # Если упоминается "стайная", но нет числа, возвращаем 6
        if any(word in text.lower() for word in ['стайн', 'групп', 'school']):
            return 6
        
        return 1  # По умолчанию одиночная
    
    def determine_difficulty(self, text: str) -> int:
        """Определить сложность содержания (1-3)"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['легк', 'простой', 'неприхотлив', 'начинающ', 'easy', 'beginner']):
            return 1
        elif any(word in text_lower for word in ['сложн', 'трудн', 'требовательн', 'advanced', 'expert']):
            return 3
        else:
            return 2  # Средняя сложность
    
    def determine_fish_type(self, text: str, url: str) -> str:
        """Определить тип рыбы (freshwater/marine)"""
        text_lower = text.lower()
        url_lower = url.lower()
        
        if any(word in text_lower or word in url_lower for word in ['морск', 'marine', 'saltwater', 'reef']):
            return "marine"
        
        return "freshwater"  # По умолчанию пресноводная
    
    def parse_fish_article(self, url: str) -> Optional[Dict]:
        """Парсинг отдельной статьи о рыбе"""
        logger.info(f"Парсинг статьи: {url}")
        soup = self.get_page(url)
        if not soup:
            return None
        
        fish_data = {
            'id': self.fish_id_counter,
            'name_ru': '',
            'name_lat': '',
            'type': 'freshwater',
            'family_group': '',
            'size_cm': 0,
            'min_tank_liters': 0,
            'bio_load_points': 2,
            'temperament': 'Мирный',
            'min_group_size': 1,
            'difficulty': 2,
            'water_params': {
                'ph_min': None,
                'ph_max': None,
                'temp_min': None,
                'temp_max': None
            },
            'incompatible_tags': [],
            'description_short': '',
            'features_list': [],
            'image_url': '',  # Добавляем поле для изображения
            'article_url': url  # Сохраняем URL статьи для перепарсинга
        }
        
        # Извлечение заголовка (name_ru)
        title_selectors = ['h1', '.entry-title', '.post-title', '.article-title', 'title']
        for selector in title_selectors:
            title_elem = soup.select_one(selector)
            if title_elem:
                title_text = title_elem.get_text(strip=True)
                if title_text:
                    fish_data['name_ru'] = title_text
                    # Извлекаем латинское название из заголовка
                    fish_data['name_lat'] = self.extract_latin_name(title_text)
                    break
        
        # Если не нашли латинское название в заголовке, ищем в тексте
        if not fish_data['name_lat']:
            article_text = soup.get_text()
            fish_data['name_lat'] = self.extract_latin_name(article_text)
        
        # Извлечение основного изображения (улучшенная версия)
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
            'main article'
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
                        skip_patterns = ['logo', 'icon', 'avatar', 'banner', 'thumb', 'thumbnail', 'wp-', 'emoji']
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
                            # Если размер не указан, берем изображение
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
                    skip_patterns = ['logo', 'icon', 'avatar', 'banner', 'thumb', 'wp-admin']
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
        
        if image_url:
            fish_data['image_url'] = image_url
        
        # Извлечение текста статьи
        content_selectors = [
            '.entry-content',
            '.post-content',
            '.article-content',
            '.content',
            'article',
            '.post-body'
        ]
        
        article_text = ""
        for selector in content_selectors:
            content_elem = soup.select_one(selector)
            if content_elem:
                article_text = content_elem.get_text()
                break
        
        if not article_text:
            article_text = soup.get_text()
        
        # Извлечение описания (description_short)
        # Пробуем найти несколько первых абзацев для более полного описания
        paragraphs = soup.select('p')
        description_parts = []
        for para in paragraphs[:5]:  # Берем первые 5 абзацев
            text = para.get_text(strip=True)
            if len(text) > 30:  # Пропускаем слишком короткие абзацы
                description_parts.append(text)
        
        if description_parts:
            # Объединяем абзацы в одно описание
            full_description = ' '.join(description_parts)
            # Ограничиваем длину до 1000 символов
            fish_data['description_short'] = full_description[:1000]
        elif article_text:
            # Если не нашли абзацы, берем начало текста статьи
            fish_data['description_short'] = article_text[:1000].strip()
        
        # Извлечение параметров воды
        water_params = self.extract_water_params(article_text)
        fish_data['water_params'].update(water_params)
        
        # Извлечение минимального объема
        min_volume = self.extract_min_volume(article_text)
        if min_volume:
            fish_data['min_tank_liters'] = min_volume
        
        # Извлечение размера
        size = self.extract_size(article_text)
        if size:
            fish_data['size_cm'] = int(size)
        
        # Определение темперамента
        fish_data['temperament'] = self.extract_temperament(article_text)
        
        # Определение минимального размера стаи
        fish_data['min_group_size'] = self.extract_min_group_size(article_text)
        
        # Определение сложности
        fish_data['difficulty'] = self.determine_difficulty(article_text)
        
        # Определение типа (пресноводная/морская)
        fish_data['type'] = self.determine_fish_type(article_text, url)
        
        # Извлечение семейства (family_group)
        family_patterns = [
            r'семейств[оа][:\s]+([А-Яа-я\s]+)',
            r'отряд[:\s]+([А-Яа-я\s]+)',
        ]
        
        for pattern in family_patterns:
            match = re.search(pattern, article_text, re.IGNORECASE)
            if match:
                fish_data['family_group'] = match.group(1).strip()
                break
        
        # Создание списка особенностей
        features = []
        if fish_data['water_params']['temp_min']:
            features.append(f"Температура: {fish_data['water_params']['temp_min']}-{fish_data['water_params']['temp_max']}°C")
        if fish_data['water_params']['ph_min']:
            features.append(f"pH: {fish_data['water_params']['ph_min']}-{fish_data['water_params']['ph_max']}")
        if fish_data['min_tank_liters']:
            features.append(f"Минимальный объем: {fish_data['min_tank_liters']} л")
        if fish_data['temperament']:
            features.append(f"Темперамент: {fish_data['temperament']}")
        
        fish_data['features_list'] = features
        
        # Сохраняем image_url (пользователю нужны фото)
        # Если не нашли изображение через селекторы, пробуем найти любую картинку в статье
        if not fish_data.get('image_url'):
            all_images = soup.find_all('img')
            for img in all_images:
                img_src = img.get('src') or img.get('data-src')
                if img_src and not any(skip in img_src.lower() for skip in ['logo', 'icon', 'avatar', 'banner']):
                    fish_data['image_url'] = urljoin(BASE_URL, img_src)
                    break
        
        self.fish_id_counter += 1
        return fish_data
    
    def run(self):
        """Основной метод запуска парсера"""
        logger.info("Начало парсинга каталога fanfishka.ru")
        
        # Шаг 1: Определение последней страницы
        last_page = self.find_last_page()
        
        # Шаг 2: Сбор всех ссылок на статьи
        logger.info(f"Сбор ссылок со страниц 1-{last_page}...")
        for page_num in range(1, last_page + 1):
            page_url = f"https://fanfishka.ru/akvariumnye-stati/akvariumnye_rybki/page/{page_num}/"
            logger.info(f"Обработка страницы {page_num}/{last_page}")
            
            links = self.collect_fish_links_from_page(page_url)
            self.fish_links.extend(links)
            
            time.sleep(DELAY_BETWEEN_REQUESTS)
        
        # Удаляем дубликаты
        self.fish_links = list(set(self.fish_links))
        logger.info(f"Всего собрано {len(self.fish_links)} уникальных ссылок на статьи")
        
        # Шаг 3: Парсинг каждой статьи
        logger.info("Начало парсинга статей...")
        for i, link in enumerate(self.fish_links, 1):
            logger.info(f"Обработка статьи {i}/{len(self.fish_links)}")
            
            fish_data = self.parse_fish_article(link)
            if fish_data:
                self.fish_data.append(fish_data)
                has_photo = "✅" if fish_data.get('image_url') else "❌"
                logger.info(f"✓ Собраны данные: {fish_data['name_ru']} {has_photo} фото")
            else:
                logger.warning(f"✗ Не удалось собрать данные из {link}")
            
            # Сохраняем промежуточные результаты каждые 10 статей
            if i % 10 == 0:
                with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                    json.dump(self.fish_data, f, ensure_ascii=False, indent=2)
                logger.info(f"💾 Промежуточное сохранение: {len(self.fish_data)} записей")
            
            time.sleep(DELAY_BETWEEN_REQUESTS)
        
        # Шаг 4: Сохранение результатов
        logger.info(f"Сохранение {len(self.fish_data)} записей в {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.fish_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"✓ Парсинг завершен! Результаты сохранены в {OUTPUT_FILE}")
        logger.info(f"Всего обработано: {len(self.fish_data)} рыб")


if __name__ == "__main__":
    parser = FanFishkaParser()
    try:
        parser.run()
    except KeyboardInterrupt:
        logger.info("\nПарсинг прерван пользователем")
        if parser.fish_data:
            logger.info(f"Сохранение частичных результатов ({len(parser.fish_data)} записей)...")
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(parser.fish_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"Критическая ошибка: {e}", exc_info=True)

