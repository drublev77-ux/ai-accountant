#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# 🔄 БЫСТРОЕ ОБНОВЛЕНИЕ НА GITHUB
# ═══════════════════════════════════════════════════════════════

set -e

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║         🔄 ОБНОВЛЕНИЕ КОДА НА GITHUB 🔄                   ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# Сообщение коммита
COMMIT_MESSAGE="${1:-Update: $(date '+%Y-%m-%d %H:%M:%S')}"

echo -e "${BLUE}▶ Добавление изменений...${NC}"
git add .

echo -e "${BLUE}▶ Создание коммита...${NC}"
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  Нет изменений для коммита${NC}"
    exit 0
fi

git commit -m "$COMMIT_MESSAGE"

echo -e "${GREEN}✅ Коммит создан: $COMMIT_MESSAGE${NC}"

echo -e "\n${BLUE}▶ Загрузка на GitHub...${NC}"
git push

echo -e "\n${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║              ✅ КОД УСПЕШНО ОБНОВЛЕН! ✅                  ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

echo -e "${BLUE}🌐 Репозиторий:${NC}"
echo -e "${PURPLE}   https://github.com/drublev77-ux/ai-accountant${NC}\n"

echo -e "${YELLOW}💡 Автодеплой на Vercel/Netlify начнется автоматически!${NC}\n"
