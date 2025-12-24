# 🚀 Автоматический деплой AI Accountant

## ✅ Текущий статус

- ✅ Git репозиторий инициализирован
- ✅ Первый коммит создан
- ✅ GitHub remote добавлен: `https://github.com/drublev77-ux/ai-accountant.git`
- ✅ GitHub Actions workflow настроен
- ⏳ Требуется: Push кода на GitHub

---

## 📋 Следующие шаги

### 1. Push кода на GitHub

```bash
git push -u origin main
```

**Важно:** При первом push вам может потребоваться авторизация GitHub.

### 2. Включите GitHub Pages в настройках репозитория

1. Откройте: https://github.com/drublev77-ux/ai-accountant/settings/pages
2. В разделе "Source" выберите: **GitHub Actions**
3. Сохраните изменения

### 3. Готово! Теперь автодеплой работает

После настройки каждый `git push` в ветку `main` будет автоматически:

- ✅ Проверять TypeScript типы и ESLint правила
- ✅ Собирать проект (`npm run build:gh-pages`)
- ✅ Деплоить на GitHub Pages

---

## 🎯 Как это работает

### Автоматический деплой запускается при:

- Push в ветку `main`
- Pull Request в ветку `main` (только валидация и сборка)
- Ручной запуск через GitHub Actions UI

### Workflow состоит из 3 шагов:

1. **Validate** - проверка кода (`npm run check:safe`)
2. **Build** - сборка приложения (`npm run build:gh-pages`)
3. **Deploy** - деплой на GitHub Pages (только для `main`)

---

## 📖 Ваш URL после деплоя

После первого успешного деплоя ваше приложение будет доступно по адресу:

```
https://drublev77-ux.github.io/ai-accountant/
```

---

## 🔄 Рабочий процесс

### Обычный workflow:

```bash
# 1. Внесите изменения
vim src/routes/index.tsx

# 2. Проверьте локально (опционально)
npm run check:safe

# 3. Закоммитите изменения
git add .
git commit -m "feat: добавил новую функцию"

# 4. Push на GitHub
git push
```

**GitHub Actions автоматически:**
- Проверит код
- Соберет проект
- Задеплоит на production
- Отправит уведомление о статусе

---

## 🛠️ Полезные команды

### Локальная разработка:
```bash
npm run check:safe        # Проверка типов и линтинг
npm run build:gh-pages    # Локальная сборка для GitHub Pages
npm run serve:gh-pages    # Preview собранного приложения
```

### Git операции:
```bash
git status                # Проверить статус
git log --oneline -5      # Последние 5 коммитов
git remote -v             # Показать remote репозитории
```

### GitHub CLI (если установлен):
```bash
gh repo view              # Открыть репозиторий в браузере
gh workflow view          # Просмотреть workflows
gh run list               # Список запусков workflow
gh run watch              # Следить за текущим запуском
```

---

## 📊 Мониторинг деплоя

### Проверить статус деплоя:

1. **GitHub Actions:** https://github.com/drublev77-ux/ai-accountant/actions
2. **GitHub Pages:** https://github.com/drublev77-ux/ai-accountant/deployments

### Просмотреть логи сборки:

1. Откройте: https://github.com/drublev77-ux/ai-accountant/actions
2. Выберите нужный workflow run
3. Разверните нужный шаг для просмотра логов

---

## 🚨 Решение проблем

### Деплой не запускается:

1. Проверьте GitHub Pages настройки
2. Убедитесь, что Source = "GitHub Actions"
3. Проверьте права доступа в Settings → Actions → General

### Ошибки при сборке:

1. Запустите `npm run check:safe` локально
2. Исправьте все ошибки TypeScript/ESLint
3. Сделайте новый commit и push

### Push требует авторизации:

```bash
# Используйте GitHub CLI для авторизации
gh auth login

# Или настройте SSH ключ
ssh-keygen -t ed25519 -C "drublev77@gmail.com"
# Добавьте ключ в GitHub Settings → SSH Keys
```

---

## 🎉 Преимущества автодеплоя

✅ **Zero downtime** - автоматические деплои без простоев
✅ **CI/CD pipeline** - автоматическая проверка кода
✅ **Preview URLs** - каждый PR получает preview URL
✅ **Rollback** - легкий откат к предыдущей версии
✅ **Build logs** - полная прозрачность процесса сборки
✅ **Auto-updates** - GitHub Pages CDN автоматически обновляется

---

## 📞 Поддержка

- **GitHub Issues:** https://github.com/drublev77-ux/ai-accountant/issues
- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **GitHub Pages Docs:** https://docs.github.com/en/pages

---

**Готово к деплою!** Просто выполните `git push -u origin main` 🚀
