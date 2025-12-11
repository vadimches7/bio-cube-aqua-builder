#!/bin/bash
# Скрипт для проверки статуса парсинга

LOG_FILE="/Users/vadikaipro/.cursor/projects/Users-vadikaipro-Bio-cube-bio-cube-aqua-builder/terminals/543956.txt"
OUTPUT_FILE="/Users/vadikaipro/Bio-cube приложение/bio-cube-aqua-builder/scripts/fish_catalog.json"

echo "═══════════════════════════════════════════════════════"
echo "  📊 СТАТУС ПАРСИНГА FANFISHKA.RU"
echo "═══════════════════════════════════════════════════════"
echo ""

# Проверка процесса
if ps aux | grep -i "fanfishka_parser" | grep -v grep > /dev/null; then
    echo "✅ Процесс запущен"
else
    echo "❌ Процесс не найден"
fi

echo ""

# Проверка файла результатов
if [ -f "$OUTPUT_FILE" ]; then
    COUNT=$(python3 -c "import json; data = json.load(open('$OUTPUT_FILE')); print(len(data))" 2>/dev/null || echo "0")
    SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    echo "📁 Файл результатов: СУЩЕСТВУЕТ"
    echo "   Записей: $COUNT"
    echo "   Размер: $SIZE"
    
    # Проверка наличия фото
    WITH_PHOTO=$(python3 -c "
import json
try:
    data = json.load(open('$OUTPUT_FILE'))
    with_photo = sum(1 for item in data if item.get('image_url', '').strip())
    print(with_photo)
except:
    print('0')
" 2>/dev/null || echo "0")
    
    if [ "$COUNT" != "0" ]; then
        PHOTO_PERCENT=$(python3 -c "print(round($WITH_PHOTO / $COUNT * 100, 1))" 2>/dev/null || echo "0")
        echo "   📸 С фото: $WITH_PHOTO из $COUNT ($PHOTO_PERCENT%)"
    else
        echo "   📸 С фото: проверка недоступна"
    fi
else
    echo "📁 Файл результатов: ЕЩЕ НЕ СОЗДАН"
    echo "   (Файл создается каждые 10 статей или после завершения)"
fi

echo ""

# Текущий прогресс из лога
CURRENT=$(tail -50 "$LOG_FILE" 2>/dev/null | grep "Обработка статьи" | tail -1 | grep -oE "Обработка статьи [0-9]+" | grep -oE "[0-9]+")
TOTAL=942
if [ ! -z "$CURRENT" ] && [ "$CURRENT" != "" ]; then
    PERCENT=$(python3 -c "print(round($CURRENT / $TOTAL * 100, 1))" 2>/dev/null || echo "0")
    REMAINING=$((TOTAL - CURRENT))
    ETA_MINUTES=$((REMAINING / 60))
    echo "📈 Прогресс: $CURRENT из $TOTAL статей ($PERCENT%)"
    echo "⏱️  Примерное время до завершения: ~$ETA_MINUTES минут"
    
    # Проверка фото в логах
    PHOTO_COUNT=$(tail -100 "$LOG_FILE" 2>/dev/null | grep "✓ Собраны данные" | grep "✅" | wc -l | tr -d ' ')
    if [ "$PHOTO_COUNT" != "0" ]; then
        echo "📸 Фото извлекаются: ДА (найдено в последних записях)"
    else
        echo "📸 Фото: проверяется..."
    fi
else
    echo "📈 Прогресс: определяется..."
fi

echo ""

# Последние обработанные рыбы
echo "🐟 Последние обработанные рыбы:"
tail -20 "$LOG_FILE" 2>/dev/null | grep "✓ Собраны данные" | tail -5 | sed 's/.*✓ Собраны данные: /   • /' || echo "   (данные еще не доступны)"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Время проверки: $(date '+%H:%M:%S')"
echo "═══════════════════════════════════════════════════════"

