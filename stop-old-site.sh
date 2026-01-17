#!/bin/bash
# Скрипт для остановки старого веб-сервера

echo "🔍 Ищем процесс на порту 80..."

# Проверяем что занимает порт 80
PROCESS=$(netstat -tulpn | grep :80 | head -1)
if [ -z "$PROCESS" ]; then
    PROCESS=$(ss -tulpn | grep :80 | head -1)
fi

if [ ! -z "$PROCESS" ]; then
    echo "Найден процесс на порту 80:"
    echo "$PROCESS"
else
    echo "Порт 80 свободен"
fi

echo ""
echo "🛑 Останавливаем Apache..."

# Останавливаем Apache2
if systemctl is-active --quiet apache2 2>/dev/null; then
    echo "Останавливаем apache2..."
    systemctl stop apache2
    systemctl disable apache2
fi

# Останавливаем httpd (если используется)
if systemctl is-active --quiet httpd 2>/dev/null; then
    echo "Останавливаем httpd..."
    systemctl stop httpd
    systemctl disable httpd
fi

# Убиваем процессы Apache если они остались
if pgrep apache2 > /dev/null; then
    echo "Убиваем процессы apache2..."
    pkill apache2
fi

if pgrep httpd > /dev/null; then
    echo "Убиваем процессы httpd..."
    pkill httpd
fi

echo ""
echo "✅ Проверяем что порт 80 свободен..."
sleep 2

if netstat -tulpn | grep :80 > /dev/null; then
    echo "⚠️  Порт 80 все еще занят!"
    echo "Процессы на порту 80:"
    netstat -tulpn | grep :80
    echo ""
    echo "Попробуйте вручную:"
    echo "  lsof -i :80"
    echo "  kill -9 <PID>"
else
    echo "✅ Порт 80 свободен!"
    echo ""
    echo "🚀 Запускаем nginx..."
    systemctl start nginx
    systemctl status nginx --no-pager
fi
