#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "  🔍 ПРОВЕРКА ГОТОВНОСТИ К ДЕПЛОЮ"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка конфигурационных файлов
echo "📋 Конфигурационные файлы:"
echo ""

files=(
    ".github/workflows/github-pages.yml"
    ".github/workflows/deploy.yml"
    ".github/workflows/netlify-deploy.yml"
    "vercel.json"
    "netlify.toml"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅${NC} $file"
    else
        echo -e "  ${RED}❌${NC} $file - НЕ НАЙДЕН!"
    fi
done

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

# Проверка документации
echo "📚 Документация:"
echo ""

docs=(
    "БЫСТРЫЙ_СТАРТ.txt"
    "ДЕПЛОЙ_ИНСТРУКЦИЯ.md"
    "DEPLOYMENT_ALL_PLATFORMS.md"
    "CHECKLIST_ДЕПЛОЙ.md"
    "ИТОГОВЫЙ_ОТЧЁТ.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "  ${GREEN}✅${NC} $doc"
    else
        echo -e "  ${YELLOW}⚠${NC} $doc - не найден"
    fi
done

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

# Проверка Git репозитория
echo "🔗 Git репозиторий:"
echo ""

if git remote -v | grep -q "drublev77-ux/ai-accountant"; then
    echo -e "  ${GREEN}✅${NC} Репозиторий настроен"
    git remote -v | grep origin | head -1 | awk '{print "     " $2}'
else
    echo -e "  ${RED}❌${NC} Репозиторий не настроен"
fi

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

# Проверка package.json
echo "📦 Package.json скрипты:"
echo ""

if grep -q "build:gh-pages" package.json; then
    echo -e "  ${GREEN}✅${NC} build:gh-pages"
fi

if grep -q "deploy:vercel" package.json; then
    echo -e "  ${GREEN}✅${NC} deploy:vercel"
fi

if grep -q "deploy:netlify" package.json; then
    echo -e "  ${GREEN}✅${NC} deploy:netlify"
fi

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

# Проверка dist директории
echo "🏗️  Build статус:"
echo ""

if [ -d "dist" ]; then
    echo -e "  ${GREEN}✅${NC} dist/ папка существует"
    dist_size=$(du -sh dist 2>/dev/null | awk '{print $1}')
    echo "     Размер: $dist_size"
else
    echo -e "  ${YELLOW}⚠${NC}  dist/ папка не найдена (запустите: npm run build)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🎯 СЛЕДУЮЩИЕ ШАГИ"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Активируйте GitHub Pages:"
echo "   https://github.com/drublev77-ux/ai-accountant/settings/pages"
echo "   Source → GitHub Actions"
echo ""
echo "2. Загрузите код на GitHub:"
echo "   git add ."
echo "   git commit -m 'Настройка деплоя'"
echo "   git push origin main"
echo ""
echo "3. Создайте проекты на:"
echo "   • Vercel:  https://vercel.com"
echo "   • Netlify: https://netlify.com"
echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "📖 Подробные инструкции: БЫСТРЫЙ_СТАРТ.txt"
echo ""
echo "═══════════════════════════════════════════════════════════════"

