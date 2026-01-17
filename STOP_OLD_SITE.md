# Остановка старого PHP сайта

## Шаг 1: Найти какой процесс занимает порт 80

```bash
# Проверьте что занимает порт 80
netstat -tulpn | grep :80
# или
ss -tulpn | grep :80
# или
lsof -i :80
```

## Шаг 2: Остановить Apache (если он запущен)

```bash
# Проверьте статус Apache
systemctl status apache2

# Остановите Apache
systemctl stop apache2

# Отключите автозапуск Apache
systemctl disable apache2

# Или если используется httpd
systemctl stop httpd
systemctl disable httpd
```

## Шаг 3: Остановить другие веб-серверы

```bash
# Проверьте все запущенные веб-серверы
ps aux | grep -E 'apache|httpd|nginx|php-fpm'

# Остановите найденные процессы
# Например, если найден Apache:
killall apache2
# или
pkill apache2
```

## Шаг 4: Убедитесь что порт 80 свободен

```bash
netstat -tulpn | grep :80
```

Если ничего не выводится - порт свободен.

## Шаг 5: Запустите nginx

```bash
systemctl start nginx
systemctl status nginx
```

## Полная команда для быстрой остановки Apache:

```bash
# Остановить и отключить Apache
systemctl stop apache2 2>/dev/null || systemctl stop httpd 2>/dev/null
systemctl disable apache2 2>/dev/null || systemctl disable httpd 2>/dev/null

# Убить все процессы Apache если они остались
pkill apache2 2>/dev/null || pkill httpd 2>/dev/null

# Проверить что порт свободен
netstat -tulpn | grep :80

# Запустить nginx
systemctl start nginx
systemctl status nginx
```
