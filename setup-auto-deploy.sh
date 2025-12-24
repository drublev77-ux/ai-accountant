#!/bin/bash

# 🚀 Скрипт быстрой настройки автоматического деплоя
# AI Accountant - GitHub + Vercel Auto Deploy Setup

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Автоматический деплой: Git + Vercel Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Проверка Git репозитория
if [ ! -d .git ]; then
    echo "❌ Git репозиторий не найден!"
    echo "ℹ️  Инициализируем Git..."
    git init
    git branch -m main
    echo "✅ Git инициализирован"
fi

# Проверка коммитов
COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "0")
if [ "$COMMIT_COUNT" -eq "0" ]; then
    echo "ℹ️  Создаем первый коммит..."
    git add .
    git commit -m "feat: Initial commit - AI Accountant

Production-ready React app with:
- React 19 + TypeScript + Tailwind CSS
- shadcn/ui components
- TanStack Router & Query
- Vercel deployment ready

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
    echo "✅ Коммит создан"
fi

echo ""
echo "📊 Текущий статус:"
echo "   Ветка: $(git branch --show-current)"
echo "   Коммитов: $(git rev-list --count HEAD)"
echo "   Последний коммит: $(git log -1 --oneline)"
echo ""

# Проверка наличия remote
if git remote | grep -q "origin"; then
    REMOTE_URL=$(git remote get-url origin)
    echo "✅ Remote 'origin' уже настроен: $REMOTE_URL"
    echo ""
    read -p "🔄 Хотите push'нуть изменения? (y/n): " PUSH_NOW
    if [ "$PUSH_NOW" = "y" ] || [ "$PUSH_NOW" = "Y" ]; then
        echo "⏳ Pushing to GitHub..."
        git push -u origin main
        echo "✅ Код успешно загружен на GitHub!"
    fi
else
    echo "⚠️  Remote 'origin' не настроен"
    echo ""
    echo "📝 Варианты настройки:"
    echo ""
    echo "1️⃣  Вариант 1: У меня уже есть GitHub репозиторий"
    echo "2️⃣  Вариант 2: Нужно создать новый репозиторий"
    echo "3️⃣  Вариант 3: Настроить позже вручную"
    echo ""
    read -p "Выберите вариант (1/2/3): " CHOICE

    case $CHOICE in
        1)
            echo ""
            read -p "📌 Введите URL вашего GitHub репозитория: " REPO_URL
            if [ -n "$REPO_URL" ]; then
                git remote add origin "$REPO_URL"
                echo "✅ Remote добавлен: $REPO_URL"
                echo ""
                read -p "🔄 Push'нуть код сейчас? (y/n): " PUSH_NOW
                if [ "$PUSH_NOW" = "y" ] || [ "$PUSH_NOW" = "Y" ]; then
                    echo "⏳ Pushing to GitHub..."
                    git push -u origin main
                    echo "✅ Код успешно загружен!"
                fi
            else
                echo "❌ URL не указан"
            fi
            ;;
        2)
            echo ""
            echo "📌 Создание нового GitHub репозитория:"
            echo ""
            read -p "Введите имя репозитория (по умолчанию: ai-accountant): " REPO_NAME
            REPO_NAME=${REPO_NAME:-ai-accountant}

            read -p "Введите ваш GitHub username: " GITHUB_USER

            if [ -z "$GITHUB_USER" ]; then
                echo "❌ Username не указан"
                exit 1
            fi

            echo ""
            echo "🔧 Проверяем наличие GitHub CLI (gh)..."

            if command -v gh &> /dev/null; then
                echo "✅ GitHub CLI найден"
                echo "⏳ Создаем репозиторий через gh..."

                if gh repo create "$REPO_NAME" --public --source=. --remote=origin --push; then
                    echo "✅ Репозиторий создан и код загружен!"
                    echo "🔗 URL: https://github.com/$GITHUB_USER/$REPO_NAME"
                else
                    echo "⚠️  Не удалось создать через gh. Используем ручной метод..."
                    MANUAL_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"
                    git remote add origin "$MANUAL_URL"
                    echo "ℹ️  Создайте репозиторий вручную: https://github.com/new"
                    echo "ℹ️  После создания выполните: git push -u origin main"
                fi
            else
                echo "⚠️  GitHub CLI не установлен"
                echo ""
                echo "📝 Шаги для ручной настройки:"
                echo "   1. Откройте: https://github.com/new"
                echo "   2. Имя репозитория: $REPO_NAME"
                echo "   3. НЕ инициализируйте с README/LICENSE/.gitignore"
                echo "   4. Создайте репозиторий"
                echo "   5. Выполните:"
                echo ""
                MANUAL_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"
                echo "      git remote add origin $MANUAL_URL"
                echo "      git push -u origin main"
                echo ""
                git remote add origin "$MANUAL_URL" 2>/dev/null || true
                echo "✅ Remote добавлен (выполните push после создания репозитория)"
            fi
            ;;
        3)
            echo ""
            echo "📝 Для ручной настройки позже:"
            echo ""
            echo "   git remote add origin <URL>"
            echo "   git push -u origin main"
            echo ""
            ;;
        *)
            echo "❌ Неверный выбор"
            exit 1
            ;;
    esac
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Следующие шаги для настройки автодеплоя на Vercel:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Откройте Vercel Dashboard:"
echo "   🔗 https://vercel.com/drublev77-4252s-projects/ai-accountant/settings"
echo ""
echo "2. Перейдите в раздел 'Git'"
echo ""
echo "3. Нажмите 'Connect Git Repository'"
echo ""
echo "4. Выберите ваш GitHub репозиторий"
echo ""
echo "5. Vercel автоматически настроит:"
echo "   ✅ Деплой при каждом push в main"
echo "   ✅ Preview deployments для PR"
echo "   ✅ Автоматическую сборку"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Подробная инструкция: AUTO_DEPLOY_SETUP.md"
echo ""
echo "✨ После настройки каждый 'git push' будет автоматически"
echo "   деплоить ваше приложение на Vercel!"
echo ""
