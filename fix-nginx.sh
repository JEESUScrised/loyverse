#!/bin/bash
# Скрипт для исправления конфигурации nginx

echo "Проверяем конфигурацию nginx..."

# Проверяем синтаксис
nginx -t

# Если есть ошибки, показываем их
if [ $? -ne 0 ]; then
    echo "Ошибки в конфигурации nginx. Проверяем логи..."
    journalctl -xeu nginx.service --no-pager | tail -20
fi
