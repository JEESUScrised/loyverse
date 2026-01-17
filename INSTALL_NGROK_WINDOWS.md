# Установка ngrok на Windows (без прав администратора)

## Способ 1: Прямая загрузка (рекомендуется)

1. **Скачайте ngrok:**
   - Зайдите на https://ngrok.com/download
   - Выберите "Windows" → скачайте ZIP файл

2. **Распакуйте:**
   - Распакуйте `ngrok.exe` в любую папку (например: `C:\Users\user\ngrok\`)
   - Или прямо в папку проекта: `C:\Users\user\Desktop\Loyverse\ngrok\`

3. **Добавьте в PATH (опционально):**
   - Правый клик на "Этот компьютер" → Свойства
   - Дополнительные параметры системы → Переменные среды
   - В "Переменные пользователя" найдите Path → Изменить
   - Добавьте путь к папке с ngrok.exe

4. **Или используйте напрямую:**
   ```powershell
   # Перейдите в папку с ngrok.exe
   cd C:\Users\user\Desktop\Loyverse\ngrok
   
   # Настройте authtoken
   .\ngrok.exe config add-authtoken YOUR_AUTH_TOKEN
   
   # Запустите
   .\ngrok.exe http 3004
   ```

## Способ 2: Через PowerShell (без chocolatey)

```powershell
# Создайте папку для ngrok
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\ngrok"

# Скачайте ngrok
Invoke-WebRequest -Uri "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip" -OutFile "$env:USERPROFILE\ngrok\ngrok.zip"

# Распакуйте
Expand-Archive -Path "$env:USERPROFILE\ngrok\ngrok.zip" -DestinationPath "$env:USERPROFILE\ngrok" -Force

# Удалите архив
Remove-Item "$env:USERPROFILE\ngrok\ngrok.zip"

# Добавьте в PATH для текущей сессии
$env:Path += ";$env:USERPROFILE\ngrok"

# Проверьте
ngrok version
```

## Способ 3: Установка с правами администратора

Если у вас есть права администратора:

1. **Откройте PowerShell от имени администратора:**
   - Правый клик на PowerShell → "Запуск от имени администратора"

2. **Запустите:**
   ```powershell
   choco install ngrok -y
   ```

## Быстрый старт после установки

1. **Зарегистрируйтесь на ngrok.com** (бесплатно)
2. **Скопируйте authtoken** из dashboard
3. **Настройте:**
   ```powershell
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```
4. **Запустите туннель:**
   ```powershell
   ngrok http 3004
   ```

## Использование без установки в PATH

Если не хотите добавлять в PATH, используйте полный путь:

```powershell
# Вместо: ngrok http 3004
# Используйте:
C:\Users\user\Desktop\Loyverse\ngrok\ngrok.exe http 3004
```

Или создайте алиас в PowerShell:

```powershell
# Добавьте в профиль PowerShell
notepad $PROFILE

# Добавьте строку:
Set-Alias -Name ngrok -Value "C:\Users\user\Desktop\Loyverse\ngrok\ngrok.exe"
```
