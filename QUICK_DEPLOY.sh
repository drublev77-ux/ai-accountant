#!/bin/bash

# AI Accountant - Quick Deploy Script
# Быстрый деплой production версии

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        AI Accountant - Production Deploy Script               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Функция для проверки команды
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗${NC} $1 не найден"
        return 1
    else
        echo -e "${GREEN}✓${NC} $1 установлен"
        return 0
    fi
}

# Шаг 1: Проверка окружения
echo -e "${BLUE}[1/5]${NC} Проверка окружения..."
check_command "node"
check_command "npm"
check_command "git"
echo "  Node.js: $(node -v)"
echo "  npm: $(npm -v)"
echo ""

# Шаг 2: Проверка безопасности
echo -e "${BLUE}[2/5]${NC} Проверка безопасности..."
npm audit || echo -e "${YELLOW}⚠${NC} Предупреждения обнаружены"
echo ""

# Шаг 3: Production build
echo -e "${BLUE}[3/5]${NC} Создание production сборки..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Build успешно создан"
else
    echo -e "${RED}✗${NC} Ошибка при создании build"
    exit 1
fi
echo ""

# Шаг 4: Создание архива
echo -e "${BLUE}[4/5]${NC} Создание архива для деплоя..."
cd dist
tar -czf ../ai-accountant-production.tar.gz .
cd ..

ARCHIVE_SIZE=$(du -h ai-accountant-production.tar.gz | cut -f1)
echo -e "${GREEN}✓${NC} Архив создан: $ARCHIVE_SIZE"
echo ""

# Шаг 5: Выбор платформы
echo -e "${BLUE}[5/5]${NC} Выберите платформу для деплоя:"
echo ""
echo "  1) GitHub Pages (автоматический)"
echo "  2) Vercel"
echo "  3) Netlify"
echo "  4) Только архив"
echo "  5) Локальный preview"
echo ""
read -p "Выберите опцию (1-5): " DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo ""
        echo -e "${BLUE}Деплой на GitHub Pages...${NC}"

        if git remote -v | grep -q "github.com"; then
            echo -e "${GREEN}✓${NC} GitHub remote настроен"
            git add .
            read -p "Commit message (Enter для автоматического): " COMMIT_MSG

            if [ -z "$COMMIT_MSG" ]; then
                COMMIT_MSG="Production build $(date +'%Y-%m-%d %H:%M')"
            fi

            git commit -m "$COMMIT_MSG

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>" || echo "Нет изменений"

            git push origin main
            echo ""
            echo -e "${GREEN}✓${NC} Код отправлен в GitHub"
            echo -e "${BLUE}→${NC} https://github.com/drublev77-ux/ai-accountant/actions"
        else
            echo -e "${RED}✗${NC} GitHub remote не настроен"
        fi
        ;;

    2)
        echo ""
        echo -e "${BLUE}Деплой на Vercel...${NC}"
        if check_command "vercel"; then
            vercel --prod
        else
            echo -e "${YELLOW}⚠${NC} Установите: npm i -g vercel"
        fi
        ;;

    3)
        echo ""
        echo -e "${BLUE}Деплой на Netlify...${NC}"
        if check_command "netlify"; then
            netlify deploy --prod --dir=dist
        else
            echo -e "${YELLOW}⚠${NC} Установите: npm i -g netlify-cli"
        fi
        ;;

    4)
        echo ""
        echo -e "${GREEN}✓${NC} Архив готов!"
        echo "Размер: $ARCHIVE_SIZE"
        ;;

    5)
        echo ""
        echo -e "${BLUE}Локальный preview...${NC}"
        echo "http://localhost:4173"
        npm run serve
        ;;

    *)
        echo -e "${RED}✗${NC} Неверная опция"
        exit 1
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     Деплой завершён!                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📦 Production файлы:"
echo "  • dist/ - готовая сборка"
echo "  • ai-accountant-production.tar.gz - архив"
echo ""
echo "📚 Документация:"
echo "  • PRODUCTION_READY.md"
echo "  • PRODUCTION_SUMMARY.txt"
echo ""
echo "✅ Готово к использованию!"
