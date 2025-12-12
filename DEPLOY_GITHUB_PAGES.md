# Быстрый деплой на GitHub Pages

## Проблема решена!

Ошибка `Get Pages site failed` исправлена. Теперь ваше приложение готово к развертыванию на GitHub Pages.

---

## Что нужно сделать (3 шага):

### 1. Включить GitHub Pages в репозитории

Откройте: https://github.com/drublev77-ux/ai-accountant/settings/pages

Выберите:
- **Source**: GitHub Actions

Сохраните.

### 2. Запушить изменения

```bash
git add .
git commit -m "Fix GitHub Pages deployment with enablement parameter"
git push origin main
```

### 3. Дождаться деплоя

Откройте: https://github.com/drublev77-ux/ai-accountant/actions

Статус деплоя появится через несколько секунд. Обычно занимает 2-3 минуты.

---

## Результат

После успешного деплоя ваше приложение будет доступно по адресу:

**https://drublev77-ux.github.io/ai-accountant/**

---

## Что было исправлено

1. `.github/workflows/github-pages.yml`:
   - Добавлен параметр `enablement: true` в `actions/configure-pages@v5`
   - Это автоматически включает GitHub Pages при первом запуске workflow

2. `package.json`:
   - Добавлены скрипты `build:gh-pages` и `serve:gh-pages`

3. `vite.config.js`:
   - Уже настроен корректно (использует `/ai-accountant/` как base URL)

---

## Автоматический деплой

Теперь каждый `git push` в ветку `main` автоматически:
1. Собирает приложение
2. Проверяет код (TypeScript + ESLint)
3. Развертывает на GitHub Pages

---

## Локальное тестирование

Перед push можете протестировать локально:

```bash
npm run build:gh-pages
npm run serve:gh-pages
```

Откройте: http://localhost:4173/ai-accountant/

---

## Готово!

После выполнения 3 шагов выше ваше приложение будет доступно онлайн.

Подробная документация: `GITHUB_PAGES_SETUP.md`
