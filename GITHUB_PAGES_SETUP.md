# Развертывание на GitHub Pages

## Проблема решена!

Я исправил конфигурацию GitHub Actions для корректного развертывания на GitHub Pages.

---

## Что было исправлено:

1. **GitHub Actions Workflow** (`.github/workflows/github-pages.yml`):
   - Добавлен параметр `enablement: true` в `actions/configure-pages@v5`
   - Обновлена версия Node.js до 22 (соответствует вашему окружению)
   - Упрощена структура workflow (объединены build и deploy в один job)

2. **package.json** - добавлены новые скрипты:
   - `npm run build:gh-pages` - сборка специально для GitHub Pages
   - `npm run serve:gh-pages` - локальный предпросмотр с правильным base URL

3. **vite.config.js** - уже настроен корректно:
   - При `GITHUB_PAGES=true` использует `base: "/ai-accountant/"`

---

## Пошаговая инструкция для развертывания:

### Шаг 1: Включить GitHub Pages в настройках репозитория

1. Откройте ваш репозиторий на GitHub: https://github.com/drublev77-ux/ai-accountant
2. Перейдите в **Settings** (Настройки)
3. В левом меню выберите **Pages**
4. В разделе **Source** выберите:
   - **Source**: GitHub Actions
5. Сохраните изменения

### Шаг 2: Запушить обновленный workflow в GitHub

```bash
git add .github/workflows/github-pages.yml package.json
git commit -m "Fix GitHub Pages deployment workflow"
git push origin main
```

### Шаг 3: Проверить статус деплоя

1. Перейдите на вкладку **Actions** в вашем репозитории
2. Вы увидите запущенный workflow "Deploy to GitHub Pages"
3. Дождитесь завершения (обычно 2-3 минуты)

### Шаг 4: Открыть ваше приложение

После успешного деплоя ваше приложение будет доступно по адресу:

**https://drublev77-ux.github.io/ai-accountant/**

---

## Локальное тестирование перед деплоем

Чтобы убедиться, что приложение корректно работает с GitHub Pages URL:

```bash
# Сборка для GitHub Pages
npm run build:gh-pages

# Предпросмотр с правильным base URL
npm run serve:gh-pages
```

Откройте http://localhost:4173/ai-accountant/ в браузере.

---

## Автоматический деплой

Теперь каждый раз, когда вы делаете `git push` в ветку `main`, ваше приложение автоматически:
1. Собирается с помощью Vite
2. Проверяется TypeScript и ESLint
3. Развертывается на GitHub Pages

---

## Ручной запуск деплоя

Вы также можете запустить деплой вручную:

1. Откройте вкладку **Actions** на GitHub
2. Выберите workflow "Deploy to GitHub Pages"
3. Нажмите кнопку **Run workflow**
4. Выберите ветку `main` и нажмите **Run workflow**

---

## Структура файлов для GitHub Pages

```
ai-accountant/
├── .github/
│   └── workflows/
│       └── github-pages.yml  ← Исправленный workflow
├── dist/                     ← Создается при сборке
├── vite.config.js           ← Конфигурация base URL
└── package.json             ← Новые скрипты для GH Pages
```

---

## Решение возможных проблем

### Проблема: "Get Pages site failed"
**Решение**: Убедитесь, что в настройках репозитория (Settings → Pages) выбран источник "GitHub Actions"

### Проблема: 404 при открытии страниц
**Решение**:
- Проверьте, что в `vite.config.js` установлен `base: "/ai-accountant/"`
- Убедитесь, что переменная `GITHUB_PAGES=true` установлена в workflow

### Проблема: Ассеты (CSS/JS) не загружаются
**Решение**: Это автоматически решается правильной настройкой `base` в Vite

---

## Дополнительно: Custom Domain

Если хотите использовать собственный домен:

1. Создайте файл `public/CNAME` с вашим доменом:
   ```
   your-domain.com
   ```

2. В настройках DNS вашего домена добавьте:
   ```
   A    185.199.108.153
   A    185.199.109.153
   A    185.199.110.153
   A    185.199.111.153
   ```

3. В Settings → Pages укажите ваш custom domain

---

## Мониторинг деплоя

После каждого push вы будете получать:
- Email уведомление о статусе деплоя (если включено)
- Badge статуса в README (можно добавить)
- Логи всех этапов сборки в Actions

---

## Готово!

Теперь ваше приложение автоматически развертывается на GitHub Pages при каждом push в main.

**Ссылка на ваше приложение**: https://drublev77-ux.github.io/ai-accountant/
