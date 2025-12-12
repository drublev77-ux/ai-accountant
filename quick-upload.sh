#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# 🚀 БЫСТРАЯ ЗАГРУЗКА НА GITHUB (БЕЗ ВОПРОСОВ)
# ═══════════════════════════════════════════════════════════════

set -e

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║      🚀 АВТОМАТИЧЕСКАЯ ЗАГРУЗКА НА GITHUB 🚀             ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# Токен из параметра
GITHUB_TOKEN="$1"

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ Ошибка: Передайте токен как параметр${NC}"
    echo -e "${YELLOW}Использование: ./quick-upload.sh YOUR_GITHUB_TOKEN${NC}"
    exit 1
fi

echo -e "${BLUE}▶ Получение информации о пользователе GitHub...${NC}"

# Получаем username через API
USER_INFO=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user)

if echo "$USER_INFO" | grep -q "\"login\""; then
    GITHUB_USERNAME=$(echo "$USER_INFO" | grep -o '"login": *"[^"]*"' | cut -d'"' -f4)
    USER_EMAIL=$(echo "$USER_INFO" | grep -o '"email": *"[^"]*"' | cut -d'"' -f4)
    USER_NAME=$(echo "$USER_INFO" | grep -o '"name": *"[^"]*"' | cut -d'"' -f4)

    if [ -z "$USER_EMAIL" ] || [ "$USER_EMAIL" = "null" ]; then
        USER_EMAIL="${GITHUB_USERNAME}@users.noreply.github.com"
    fi

    if [ -z "$USER_NAME" ] || [ "$USER_NAME" = "null" ]; then
        USER_NAME="$GITHUB_USERNAME"
    fi

    echo -e "${GREEN}✅ Пользователь: $GITHUB_USERNAME${NC}"
    echo -e "${GREEN}   Email: $USER_EMAIL${NC}"
else
    echo -e "${RED}❌ Неверный токен или нет доступа к API${NC}"
    echo -e "${YELLOW}Ответ: $USER_INFO${NC}"
    exit 1
fi

# Название репозитория
REPO_NAME="ai-accountant"

echo -e "\n${BLUE}▶ Создание репозитория '$REPO_NAME'...${NC}"

# Создаем репозиторий
CREATE_RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"$REPO_NAME\",\"private\":false,\"description\":\"AI Accountant - Smart Receipt Processing Application\"}")

if echo "$CREATE_RESPONSE" | grep -q "\"full_name\""; then
    echo -e "${GREEN}✅ Репозиторий создан: https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
elif echo "$CREATE_RESPONSE" | grep -q "name already exists"; then
    echo -e "${YELLOW}⚠️  Репозиторий уже существует, используем его${NC}"
else
    echo -e "${YELLOW}⚠️  Возможно репозиторий уже существует${NC}"
    echo -e "${YELLOW}Ответ: $CREATE_RESPONSE${NC}"
fi

# Инициализация Git
echo -e "\n${BLUE}▶ Настройка Git...${NC}"

if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅ Git инициализирован${NC}"
fi

git config user.name "$USER_NAME"
git config user.email "$USER_EMAIL"

echo -e "${GREEN}✅ Git настроен${NC}"

# Создание .gitignore
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'GITIGNORE'
node_modules/
dist/
build/
.DS_Store
*.log
.env
.env.local
.vercel
.claude.user/
GITIGNORE
fi

# Коммит
echo -e "\n${BLUE}▶ Создание коммита...${NC}"

git add .

if ! git diff --staged --quiet; then
    git commit -m "🚀 Initial commit: AI Accountant Application

- React 19 + TypeScript
- TanStack Router & Query
- Tailwind CSS v4
- Shadcn/ui components
- Complete deployment setup"

    echo -e "${GREEN}✅ Коммит создан${NC}"
else
    echo -e "${YELLOW}⚠️  Нет изменений для коммита${NC}"
fi

# Настройка remote
echo -e "\n${BLUE}▶ Настройка подключения к GitHub...${NC}"

REPO_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

if git remote | grep -q "^origin$"; then
    git remote remove origin
fi

git remote add origin "$REPO_URL"

echo -e "${GREEN}✅ Remote настроен${NC}"

# Переименование ветки в main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    git branch -M main
    echo -e "${GREEN}✅ Ветка переименована в main${NC}"
fi

# Push
echo -e "\n${BLUE}▶ Загрузка на GitHub...${NC}"

if git push -u origin main --force 2>&1; then
    echo -e "\n${GREEN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║            ✅ УСПЕШНО ЗАГРУЖЕНО НА GITHUB! ✅             ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"

    echo -e "${BLUE}🌐 Репозиторий:${NC}"
    echo -e "${PURPLE}   https://github.com/${GITHUB_USERNAME}/${REPO_NAME}${NC}\n"

    echo -e "${BLUE}📋 Следующие шаги:${NC}"
    echo -e "${YELLOW}   1. Откройте: https://vercel.com/new${NC}"
    echo -e "${YELLOW}   2. Импортируйте репозиторий${NC}"
    echo -e "${YELLOW}   3. Нажмите Deploy${NC}\n"

    echo -e "${GREEN}🎉 Готово! 🎉${NC}\n"
else
    echo -e "\n${RED}❌ Ошибка при загрузке${NC}"
    echo -e "${YELLOW}Проверьте права токена (нужен scope: repo)${NC}"
    exit 1
fi
