#!/bin/bash

# 🚀 Скрипт для Push в GitHub (для локальной машины)
# Автор: AI Accountant Deploy Assistant

set -e

echo "🚀 AI Accountant - Push в GitHub"
echo "=================================="
echo ""

# Проверка git репозитория
if [ ! -d .git ]; then
    echo "❌ Ошибка: Это не Git репозиторий!"
    echo "Выполните сначала: git init"
    exit 1
fi

# Проверка текущей ветки
BRANCH=$(git branch --show-current)
echo "📌 Текущая ветка: $BRANCH"

# Проверка remote
REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE" ]; then
    echo "❌ Remote 'origin' не настроен!"
    echo "Выполните: git remote add origin https://github.com/drublev77-ux/ai-accountant.git"
    exit 1
fi

echo "🔗 Remote URL: $REMOTE"
echo ""

# Проверка незакоммиченных изменений
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Обнаружены незакоммиченные изменения:"
    git status --short
    echo ""
    read -p "Создать commit? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Обновление перед push"
        echo "✅ Commit создан"
    fi
fi

# Выбор метода аутентификации
echo ""
echo "Выберите метод аутентификации:"
echo "1) Personal Access Token (рекомендуется)"
echo "2) GitHub CLI (gh)"
echo "3) SSH"
echo "4) Отмена"
echo ""
read -p "Ваш выбор (1-4): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo ""
        echo "📝 Для использования Personal Access Token:"
        echo "1. Создайте токен: https://github.com/settings/tokens/new"
        echo "2. Scope: repo (все подпункты)"
        echo "3. Скопируйте токен"
        echo ""
        read -p "Введите ваш Personal Access Token: " TOKEN

        if [ -z "$TOKEN" ]; then
            echo "❌ Токен не введён!"
            exit 1
        fi

        # Обновляем URL с токеном
        git remote set-url origin "https://${TOKEN}@github.com/drublev77-ux/ai-accountant.git"

        echo "✅ Remote обновлён с токеном"
        echo "🚀 Выполняю push..."
        git push -u origin "$BRANCH"

        # Возвращаем URL без токена для безопасности
        git remote set-url origin "https://github.com/drublev77-ux/ai-accountant.git"
        ;;

    2)
        echo "🔐 Проверка GitHub CLI..."

        if ! command -v gh &> /dev/null; then
            echo "❌ GitHub CLI не установлен!"
            echo "Установите: https://cli.github.com/"
            exit 1
        fi

        # Проверка аутентификации
        if ! gh auth status &> /dev/null; then
            echo "🔑 Выполняю аутентификацию..."
            gh auth login
        fi

        echo "🚀 Выполняю push..."
        git push -u origin "$BRANCH"
        ;;

    3)
        echo "🔐 Используется SSH..."

        # Проверяем, что remote использует SSH
        if [[ $REMOTE != git@github.com:* ]]; then
            echo "⚙️  Обновляю remote на SSH URL..."
            git remote set-url origin "git@github.com:drublev77-ux/ai-accountant.git"
        fi

        echo "🚀 Выполняю push..."
        git push -u origin "$BRANCH"
        ;;

    4)
        echo "❌ Отменено пользователем"
        exit 0
        ;;

    *)
        echo "❌ Неверный выбор!"
        exit 1
        ;;
esac

# Проверка успешности
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push успешно выполнен!"
    echo ""
    echo "🌐 Репозиторий: https://github.com/drublev77-ux/ai-accountant"
    echo "⚙️  GitHub Actions: https://github.com/drublev77-ux/ai-accountant/actions"
    echo "🚀 После завершения деплоя (2-3 минуты):"
    echo "    https://drublev77-ux.github.io/ai-accountant/"
    echo ""
else
    echo ""
    echo "❌ Push не удался!"
    echo "Проверьте права доступа и попробуйте другой метод аутентификации"
    exit 1
fi
