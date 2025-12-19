# 🚀 Автоматический деплой через Git + Vercel

## ✅ Текущий статус

- ✅ Git репозиторий инициализирован
- ✅ Первый коммит создан (557 файлов)
- ✅ Ветка: `main`
- ✅ `.gitignore` настроен корректно

---

## 📋 Шаги для настройки автоматического деплоя

### 1️⃣ Создайте GitHub репозиторий

#### Вариант A: Через GitHub Web UI
1. Откройте https://github.com/new
2. Укажите имя: `ai-accountant` (или любое другое)
3. **ВАЖНО:** НЕ инициализируйте с README, .gitignore или LICENSE
4. Создайте репозиторий

#### Вариант B: Через GitHub CLI
```bash
gh repo create ai-accountant --public --source=. --remote=origin
```

### 2️⃣ Добавьте удаленный репозиторий

После создания репозитория на GitHub:

```bash
# Замените username на ваше имя пользователя GitHub
git remote add origin https://github.com/username/ai-accountant.git

# Или используйте SSH (если настроен)
git remote add origin git@github.com:username/ai-accountant.git
```

### 3️⃣ Push код на GitHub

```bash
# Первый push с установкой upstream
git push -u origin main
```

При запросе аутентификации:
- **Username:** ваш GitHub username
- **Password:** используйте Personal Access Token (не пароль!)

#### Как создать Personal Access Token:
1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Выберите scopes: `repo` (full control)
4. Скопируйте токен (он больше не будет показан!)

### 4️⃣ Свяжите Vercel с GitHub

1. Откройте https://vercel.com/drublev77-4252s-projects/ai-accountant/settings
2. Перейдите в **Git** → **Connected Git Repository**
3. Нажмите **Connect Git Repository**
4. Выберите ваш GitHub репозиторий `ai-accountant`
5. Vercel автоматически настроит:
   - ✅ Деплой при каждом push в `main`
   - ✅ Preview deployments для pull requests
   - ✅ Автоматическую сборку

---

## 🔄 Как работает автоматический деплой

После настройки каждый push в GitHub будет автоматически:

1. **Триггерить деплой на Vercel**
2. **Собирать проект** (`npm run build`)
3. **Деплоить на production** (для ветки `main`)
4. **Создавать preview URL** (для других веток/PR)

### Пример workflow:

```bash
# Сделайте изменения в коде
# Например, отредактируйте src/routes/index.tsx

# Добавьте изменения в Git
git add .

# Создайте коммит
git commit -m "feat: добавил новый функционал"

# Push на GitHub
git push

# 🎉 Vercel автоматически задеплоит изменения!
```

---

## 🎯 Быстрый старт

Если у вас уже есть GitHub репозиторий:

```bash
# 1. Добавьте remote (замените URL)
git remote add origin https://github.com/drublev77/ai-accountant.git

# 2. Push код
git push -u origin main

# 3. Свяжите с Vercel через UI
```

---

## 🔗 Полезные ссылки

- **Vercel Dashboard:** https://vercel.com/drublev77-4252s-projects/ai-accountant
- **GitHub Tokens:** https://github.com/settings/tokens
- **Vercel Git Integration Docs:** https://vercel.com/docs/git

---

## ⚠️ Важные моменты

1. **Безопасность:**
   - `.env.local` автоматически игнорируется (не попадет в Git)
   - Keystore файлы защищены в `.gitignore`
   - Environment variables настройте в Vercel Dashboard

2. **Production Build:**
   - Vercel автоматически запустит `npm run build`
   - Static assets будут оптимизированы
   - Source maps не будут доступны публично

3. **Environment Variables:**
   - Настройте в Vercel Dashboard → Settings → Environment Variables
   - Для production добавьте нужные переменные (если есть)

---

## 📊 Статус сборки

После первого push вы увидите:
- ✅ Build logs в Vercel Dashboard
- ✅ Deployment URL
- ✅ Preview URL для каждого коммита

**Текущий проект готов к push!** 🎉
