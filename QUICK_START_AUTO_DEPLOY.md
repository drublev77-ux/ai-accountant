# ⚡ Быстрый старт - Автоматический деплой

## 🎯 Три простых шага

### 1. Запустите скрипт настройки

```bash
./setup-auto-deploy.sh
```

Скрипт автоматически:
- ✅ Проверит Git репозиторий
- ✅ Создаст первый коммит (если нужно)
- ✅ Поможет настроить GitHub remote
- ✅ Выполнит первый push

### 2. Свяжите Vercel с GitHub

1. Откройте: https://vercel.com/drublev77-4252s-projects/ai-accountant/settings/git
2. Нажмите **Connect Git Repository**
3. Выберите ваш репозиторий

**Готово!** 🎉 Автодеплой настроен!

### 3. Тестируем автодеплой

```bash
# Сделайте изменение (например, в index.html)
# Закоммитьте и push'ните
git add .
git commit -m "test: проверка автодеплоя"
git push

# Vercel автоматически задеплоит изменения!
```

---

## 🔄 Ежедневный workflow

```bash
# 1. Делаете изменения в коде
# 2. Проверяете локально
npm run check:safe

# 3. Коммитите
git add .
git commit -m "feat: добавил новую фичу"

# 4. Push на GitHub
git push

# 🚀 Vercel автоматически деплоит!
```

---

## 📊 Мониторинг деплоя

- **Vercel Dashboard:** https://vercel.com/drublev77-4252s-projects/ai-accountant
- **Build Logs:** Показывают статус сборки в реальном времени
- **Preview URLs:** Каждый коммит получает уникальный preview URL

---

## 🆘 Решение проблем

### Проблема: Git remote не настроен
```bash
git remote add origin https://github.com/username/ai-accountant.git
git push -u origin main
```

### Проблема: Нужен GitHub token
1. https://github.com/settings/tokens
2. Generate new token (classic)
3. Выберите scope: `repo`
4. Используйте токен вместо пароля

### Проблема: Build fails на Vercel
Проверьте:
- ✅ `npm run build` работает локально?
- ✅ `npm run check:safe` проходит без ошибок?
- ✅ Environment variables настроены в Vercel?

---

## 📚 Полная документация

- **Детальная инструкция:** `AUTO_DEPLOY_SETUP.md`
- **Скрипт настройки:** `./setup-auto-deploy.sh`
- **GitHub Actions:** `.github/workflows/ci.yml`

---

**Время настройки: ~5 минут** ⏱️
