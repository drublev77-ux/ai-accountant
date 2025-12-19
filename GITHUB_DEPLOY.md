# 🚀 Автоматический деплой на GitHub Pages

## ✅ Что уже настроено

Проект **полностью готов** к автоматическому деплою:

- ✅ GitHub Actions workflow (`.github/workflows/deploy.yml`)
- ✅ Оптимизированная production сборка (14KB initial bundle)
- ✅ Автоматическое code splitting
- ✅ Preload hints для быстрой загрузки
- ✅ Git репозиторий инициализирован

## 📋 Быстрый старт (3 шага)

### Шаг 1: Создайте репозиторий на GitHub

Перейдите на https://github.com/new и создайте новый репозиторий:
- **Название:** `vite-template` (или любое другое)
- **Visibility:** Public или Private (оба работают)
- ⚠️ **НЕ** создавайте README, .gitignore или LICENSE (они уже есть)

### Шаг 2: Отправьте код на GitHub

```bash
# Добавьте все файлы
git add .

# Создайте первый коммит
git commit -m "Initial commit: AI Accountant with optimizations"

# Добавьте remote (замените ВАШ_USERNAME и vite-template)
git remote add origin https://github.com/ВАШ_USERNAME/vite-template.git

# Отправьте код
git push -u origin main
```

### Шаг 3: Включите GitHub Pages

1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Settings** → **Pages** (слева в меню)
3. В разделе **Source** выберите:
   - **Source:** `GitHub Actions`
4. Нажмите **Save**

## 🎉 Готово!

Деплой запустится автоматически! Через 2-3 минуты ваш сайт будет доступен:

```
https://ВАШ_USERNAME.github.io/vite-template/
```

### Проверка деплоя:

1. Перейдите во вкладку **Actions** на GitHub
2. Дождитесь завершения workflow (зеленая галочка ✅)
3. Откройте ваш сайт по ссылке выше

---

## 🔄 Автоматические обновления

Каждый раз когда вы отправляете изменения в `main`:

```bash
git add .
git commit -m "Updated features"
git push
```

**GitHub автоматически:**
1. Запустит сборку проекта
2. Выполнит оптимизацию
3. Задеплоит новую версию на GitHub Pages

---

## 🔧 Настройка для другого имени репозитория

Если ваш репозиторий называется не `vite-template`:

### Вариант 1: Обновите конфигурацию

**package.json** (строка 11):
```json
"serve:gh-pages": "vite preview --base /ВАШ_REPO_NAME/",
```

### Вариант 2: Используйте переменную окружения

Добавьте в `.github/workflows/deploy.yml` (после строки 29):
```yaml
      - name: Build project
        run: npm run build:gh-pages
        env:
          GITHUB_PAGES: true
          REPO_NAME: ваш-репозиторий-name
```

---

## 📦 Локальный preview GitHub Pages

Проверьте как будет выглядеть сайт на GitHub Pages:

```bash
# Сборка для GitHub Pages
npm run build:gh-pages

# Запуск локального preview
npm run serve:gh-pages

# Откройте http://localhost:4173/vite-template/
```

---

## 🚨 Устранение проблем

### ❌ 404 при переходе на сайт

**Причина:** GitHub Pages не включен или неправильный base path

**Решение:**
1. Проверьте Settings → Pages → Source: `GitHub Actions`
2. Убедитесь что имя репозитория совпадает в `package.json` (строка 11)
3. Пересоберите: `git commit --allow-empty -m "Rebuild" && git push`

### ❌ Workflow не запускается

**Решение:**
1. Settings → Actions → General
2. **Workflow permissions:** выберите `Read and write permissions`
3. **Allow GitHub Actions to create and approve pull requests:** включите
4. Нажмите **Save**

### ❌ Сборка падает с ошибкой

**Решение:**
```bash
# Проверьте локально
npm run check:safe
npm run build:gh-pages

# Если есть ошибки TypeScript/ESLint - исправьте их
```

### ❌ Assets не загружаются (404)

**Причина:** Неправильный base path

**Решение:**
Убедитесь что в `vite.config.js` (строка 17):
```javascript
? `/${process.env.REPO_NAME || "vite-template"}/`
```

Совпадает с именем вашего репозитория.

---

## 🎯 Структура деплоя

`.github/workflows/deploy.yml` выполняет:

1. **Checkout** - скачивает код из репозитория
2. **Setup Node.js 20** - устанавливает Node.js
3. **npm ci** - устанавливает зависимости (быстрее чем npm install)
4. **npm run build:gh-pages** - сборка с оптимизациями
   - TypeScript проверка
   - ESLint валидация
   - Vite production build
   - Code splitting (14KB main bundle)
   - Minification с Terser
5. **Upload artifact** - загружает `dist/` в GitHub
6. **Deploy to Pages** - публикует на GitHub Pages

---

## ⚡ Производительность деплоя

| Метрика | Значение |
|---------|----------|
| **Build time** | 20-30 секунд |
| **Upload time** | 10-20 секунд |
| **Deploy time** | 30-60 секунд |
| **Total** | 2-3 минуты |
| **Initial bundle (gzip)** | 14 KB |
| **Vendor chunks cached** | ✅ |

---

## 🌐 Custom Domain (опционально)

Если хотите использовать свой домен (например, `myapp.com`):

### Шаг 1: Создайте файл CNAME

```bash
echo "myapp.com" > public/CNAME
git add public/CNAME
git commit -m "Add custom domain"
git push
```

### Шаг 2: Настройте DNS

У вашего регистратора домена (например, Cloudflare, Namecheap):

```
A    185.199.108.153
A    185.199.109.153
A    185.199.110.153
A    185.199.111.153
```

Или для CNAME (если используете subdomain):
```
CNAME    ВАШ_USERNAME.github.io
```

### Шаг 3: Укажите домен в GitHub

1. Settings → Pages → Custom domain
2. Введите `myapp.com`
3. Нажмите **Save**
4. Дождитесь проверки DNS (до 24 часов)
5. Включите **Enforce HTTPS**

---

## 📊 Мониторинг деплоя

### Через GitHub веб-интерфейс:
- Перейдите во вкладку **Actions**
- Посмотрите статус последнего workflow
- Зеленая галочка ✅ - успешно
- Красный крестик ❌ - ошибка (кликните для деталей)

### Через GitHub CLI:
```bash
# Установите GitHub CLI
brew install gh  # macOS
# или
sudo apt install gh  # Linux

# Войдите
gh auth login

# Просмотр последних runs
gh run list --workflow=deploy.yml

# Детали последнего run
gh run view

# Ручной запуск деплоя
gh workflow run deploy.yml
```

---

## 🔗 Полезные ссылки

- [GitHub Pages документация](https://docs.github.com/en/pages)
- [GitHub Actions документация](https://docs.github.com/en/actions)
- [Vite deployment guide](https://vitejs.dev/guide/static-deploy.html#github-pages)

---

## ✅ Checklist финального деплоя

Перед первым деплоем убедитесь:

- [ ] Git репозиторий создан на GitHub
- [ ] Код отправлен (`git push`)
- [ ] GitHub Pages включен (Settings → Pages → GitHub Actions)
- [ ] Workflow permissions настроены (Read and write)
- [ ] Имя репозитория совпадает в `package.json`
- [ ] Локальная сборка работает (`npm run build:gh-pages`)

После деплоя проверьте:

- [ ] Сайт открывается по ссылке
- [ ] Роутинг работает (переходы между страницами)
- [ ] Assets загружаются (картинки, иконки, стили)
- [ ] Нет ошибок в консоли браузера
- [ ] Responsive design работает на мобильных

---

**🎉 Готово! Ваш AI Accountant теперь доступен всему миру!**

Делитесь ссылкой: `https://ВАШ_USERNAME.github.io/vite-template/`
