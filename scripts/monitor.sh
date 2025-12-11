#!/bin/bash
# Скрипт для автоматического мониторинга каждую минуту

SCRIPT_DIR="/Users/vadikaipro/Bio-cube приложение/bio-cube-aqua-builder/scripts"
CHECK_SCRIPT="$SCRIPT_DIR/check_status.sh"

echo "🔍 Запуск мониторинга парсинга (каждую минуту)"
echo "Нажмите Ctrl+C для остановки"
echo ""

while true; do
    clear
    bash "$CHECK_SCRIPT"
    echo ""
    echo "⏳ Следующая проверка через 60 секунд..."
    sleep 60
done

