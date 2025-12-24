# 🚀 Инструкция: Push на GitHub

Репозиторий готов к загрузке! Выполните следующие команды **на вашей локальной машине**.

## ✅ Текущий статус

- ✅ Git репозиторий инициализирован
- ✅ Remote настроен: `https://github.com/drublev77-ux/ai-accountant.git`
- ✅ Создан commit с 509 файлами
- ✅ Branch: `main`

## 📋 Способ 1: Personal Access Token (Рекомендуется)

### 1. Создайте Personal Access Token

1. Откройте: https://github.com/settings/tokens/new
2. Настройки:
   - **Note**: `AI Accountant Deploy`
   - **Expiration**: `90 days` (или больше)
   - **Scopes**: отметьте `repo` (все подпункты)
3. Нажмите **Generate token**
4. **СКОПИРУЙТЕ токен** (показывается только один раз!)

### 2. Выполните Push

```bash
cd /path/to/vite-template

# Замените YOUR_TOKEN на ваш Personal Access Token
git remote set-url origin https://YOUR_TOKEN@github.com/drublev77-ux/ai-accountant.git

git push -u origin main
```

**Альтернатива** (токен вводится при запросе):
```bash
git push -u origin main
# Username: drublev77-ux
# Password: [вставьте ваш Personal Access Token]
```

## 📋 Способ 2: GitHub CLI (Самый простой)

### 1. Установите GitHub CLI

```bash
# macOS
brew install gh

# Windows (с Chocolatey)
choco install gh

# Linux (Ubuntu/Debian)
sudo apt install gh
```

### 2. Аутентификация и Push

```bash
cd /path/to/vite-template

# Войдите в GitHub
gh auth login
# Выберите: GitHub.com → HTTPS → Yes

# Выполните push
git push -u origin main
```

## 📋 Способ 3: SSH (Для продвинутых пользователей)

### 1. Настройте SSH ключи

Следуйте инструкции: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### 2. Измените URL и Push

```bash
cd /path/to/vite-template

# Измените remote на SSH
git remote set-url origin git@github.com:drublev77-ux/ai-accountant.git

# Push
git push -u origin main
```

## 🎯 После успешного Push

После выполнения `git push -u origin main`:

1. **GitHub Actions автоматически запустятся**:
   - Сборка проекта
   - Деплой на GitHub Pages

2. **Проверьте статус деплоя**:
   - GitHub Actions: https://github.com/drublev77-ux/ai-accountant/actions
   - После завершения (2-3 минуты) приложение будет доступно

3. **Ваш сайт будет доступен по адресу**:
   ```
   https://drublev77-ux.github.io/ai-accountant/
   ```

## ❓ Решение проблем

### "Support for password authentication was removed"
→ Используйте **Personal Access Token** вместо пароля

### "Authentication failed"
→ Проверьте правильность токена и его права (`repo` scope)

### "Permission denied (publickey)"
→ Настройте SSH ключи или используйте HTTPS с токеном

## 📚 Полезные ссылки

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub CLI](https://cli.github.com/)
- [GitHub SSH Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

**Важно**: Храните Personal Access Token в безопасности. Не делитесь им публично!
