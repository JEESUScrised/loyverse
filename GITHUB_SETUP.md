# 📤 Загрузка кода в GitHub

## Вариант 1: Через скрипт (проще)

### 1. Создайте репозиторий на GitHub

1. Откройте https://github.com/new
2. **Repository name:** `loyverse`
3. Выберите **Public** или **Private**
4. **НЕ** добавляйте README, .gitignore или лицензию
5. Нажмите **Create repository**

### 2. Создайте Personal Access Token

1. Откройте https://github.com/settings/tokens
2. **Generate new token** → **Generate new token (classic)**
3. **Note:** `Loyverse Deploy`
4. Отметьте права: **repo** (все права репозитория)
5. Нажмите **Generate token**
6. **Скопируйте токен** (он показывается только один раз!)

### 3. Запустите скрипт

```powershell
cd C:\Users\user\Desktop\Loyverse
.\push-to-github.ps1 -GitHubToken "ваш_токен" -RepoName "loyverse" -GitHubUsername "ваш_username"
```

**Пример:**
```powershell
.\push-to-github.ps1 -GitHubToken "ghp_xxxxxxxxxxxx" -RepoName "loyverse" -GitHubUsername "yourusername"
```

---

## Вариант 2: Вручную (если скрипт не работает)

### 1. Инициализируйте git

```powershell
cd C:\Users\user\Desktop\Loyverse
git init
git branch -M main
```

### 2. Добавьте файлы

```powershell
git add .
git commit -m "Initial commit: Ready for deployment"
```

### 3. Подключите GitHub

**С токеном:**
```powershell
git remote add origin https://ваш_токен@github.com/ваш_username/loyverse.git
```

**Или через SSH (если настроен):**
```powershell
git remote add origin git@github.com:ваш_username/loyverse.git
```

### 4. Загрузите код

```powershell
git push -u origin main
```

---

## Вариант 3: Через GitHub Desktop (самый простой!)

1. Скачайте https://desktop.github.com
2. Установите и войдите
3. **File → Add Local Repository**
4. Выберите папку `C:\Users\user\Desktop\Loyverse`
5. **Publish repository** → Выберите имя и нажмите **Publish**

---

## ✅ После загрузки

После того, как код загружен в GitHub:

1. ✅ Откройте репозиторий на GitHub
2. ✅ Убедитесь, что все файлы на месте
3. ✅ Следуйте инструкциям из `README_DEPLOY.md` для деплоя

---

## 🔒 Безопасность

⚠️ **ВАЖНО:**
- Никогда не коммитьте `.env` файлы с токенами
- `.gitignore` уже настроен, чтобы исключить секретные файлы
- Токены GitHub храните в безопасном месте

---

## 🆘 Если что-то не работает

### Ошибка: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://ваш_токен@github.com/ваш_username/loyverse.git
```

### Ошибка: "authentication failed"
- Проверьте, что токен правильный
- Убедитесь, что токен имеет права **repo**
- Попробуйте создать новый токен

### Ошибка: "repository not found"
- Убедитесь, что репозиторий создан на GitHub
- Проверьте правильность имени репозитория и username
