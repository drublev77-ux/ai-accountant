#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# 🚀 АВТОМАТИЧЕСКАЯ ЗАГРУЗКА НА GITHUB С ТОКЕНОМ
# ═══════════════════════════════════════════════════════════════

set -e  # Остановка при ошибке

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # Без цвета

# Функция для красивого вывода
print_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "\n${GREEN}✅ $1${NC}\n"
}

print_error() {
    echo -e "\n${RED}❌ ОШИБКА: $1${NC}\n"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Баннер
echo -e "${PURPLE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🚀 АВТОМАТИЧЕСКАЯ ЗАГРУЗКА НА GITHUB 🚀           ║
║                                                           ║
║           С использованием Personal Access Token          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# ═══════════════════════════════════════════════════════════════
# ШАГ 1: ПРОВЕРКА ЗАВИСИМОСТЕЙ
# ═══════════════════════════════════════════════════════════════
print_step "Шаг 1/7: Проверка установки Git"

if ! command -v git &> /dev/null; then
    print_error "Git не установлен! Установите Git: https://git-scm.com/"
    exit 1
fi

print_success "Git установлен: $(git --version)"

# ═══════════════════════════════════════════════════════════════
# ШАГ 2: ПОЛУЧЕНИЕ ДАННЫХ ОТ ПОЛЬЗОВАТЕЛЯ
# ═══════════════════════════════════════════════════════════════
print_step "Шаг 2/7: Сбор информации для GitHub"

# GitHub токен (можно передать как параметр)
if [ -n "$1" ]; then
    GITHUB_TOKEN="$1"
    print_info "Токен получен из параметра командной строки"
else
    echo -e "${YELLOW}Введите GitHub Personal Access Token:${NC}"
    echo -e "${BLUE}(Токен не будет виден при вводе для безопасности)${NC}"
    read -s GITHUB_TOKEN
    echo ""
fi

if [ -z "$GITHUB_TOKEN" ]; then
    print_error "Токен не может быть пустым!"
    exit 1
fi

# GitHub username
echo -e "${YELLOW}Введите ваш GitHub username:${NC}"
read GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    print_error "Username не может быть пустым!"
    exit 1
fi

# Название репозитория
echo -e "${YELLOW}Введите название репозитория (например: ai-accountant):${NC}"
read REPO_NAME

if [ -z "$REPO_NAME" ]; then
    print_error "Название репозитория не может быть пустым!"
    exit 1
fi

# Имя и email для Git
echo -e "${YELLOW}Введите ваше имя для Git (например: Ivan Petrov):${NC}"
read GIT_NAME

if [ -z "$GIT_NAME" ]; then
    GIT_NAME="$GITHUB_USERNAME"
fi

echo -e "${YELLOW}Введите ваш email для Git:${NC}"
read GIT_EMAIL

if [ -z "$GIT_EMAIL" ]; then
    GIT_EMAIL="${GITHUB_USERNAME}@users.noreply.github.com"
fi

print_success "Информация собрана!"

# ═══════════════════════════════════════════════════════════════
# ШАГ 3: СОЗДАНИЕ РЕПОЗИТОРИЯ НА GITHUB (ОПЦИОНАЛЬНО)
# ═══════════════════════════════════════════════════════════════
print_step "Шаг 3/7: Создание репозитория на GitHub"

echo -e "${YELLOW}Хотите создать новый репозиторий на GitHub автоматически? (y/n):${NC}"
read CREATE_REPO

if [ "$CREATE_REPO" = "y" ] || [ "$CREATE_REPO" = "Y" ]; then
    print_info "Создаю репозиторий на GitHub..."

    # Приватный или публичный
    echo -e "${YELLOW}Сделать репозиторий приватным? (y/n, по умолчанию: публичный):${NC}"
    read PRIVATE_REPO

    PRIVATE_FLAG="false"
    if [ "$PRIVATE_REPO" = "y" ] || [ "$PRIVATE_REPO" = "Y" ]; then
        PRIVATE_FLAG="true"
    fi

    # Создание репозитория через GitHub API
    RESPONSE=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user/repos \
        -d "{\"name\":\"$REPO_NAME\",\"private\":$PRIVATE_FLAG}")

    if echo "$RESPONSE" | grep -q "\"full_name\""; then
        print_success "Репозиторий создан: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    else
        print_error "Не удалось создать репозиторий. Возможно, он уже существует."
        echo -e "${YELLOW}Ответ GitHub: $RESPONSE${NC}"
        echo -e "${YELLOW}Продолжаем с существующим репозиторием...${NC}"
    fi
else
    print_info "Пропускаю создание репозитория. Убедитесь, что он существует на GitHub!"
fi

# ═══════════════════════════════════════════════════════════════
# ШАГ 4: ИНИЦИАЛИЗАЦИЯ GIT
# ═══════════════════════════════════════════════════════════════
print_step "Шаг 4/7: Инициализация Git"

# Проверка существования .git
if [ -d ".git" ]; then
    print_info "Git уже инициализирован"
else
    git init
    print_success "Git инициализирован"
fi

# Настройка имени и email
git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

print_success "Git настроен для $GIT_NAME <$GIT_EMAIL>"

# ═══════════════════════════════════════════════════════════════
# ШАГ 5: СОЗДАНИЕ КОММИТА
# ═══════════════════════════════════════════════════════════════
print_step "Шаг 5/7: Создание коммита"

# Создание .gitignore если его нет
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
GITIGNORE
    print_info ".gitignore создан"
fi

# Добавление файлов
print_info "Добавление файлов..."
git add .

# Проверка наличия изменений
if git diff --staged --quiet; then
    print_info "Нет изменений для коммита"
else
    git commit -m "🚀 Initial commit: AI Accountant Application

- React 19 + TypeScript setup
- TanStack Router & Query integration
- Tailwind CSS v4 styling
- Shadcn/ui components
- Complete project structure
- Ready for deployment"

    print_success "Коммит создан!"
fi

# ═══════════════════════════════════════════════════════════════
# ШАГ 6: НАСТРОЙКА REMOTE
# ═══════════════════════════════════════════════════════════════
print_step "Шаг 6/7: Настройка подключения к GitHub"

# URL с токеном
REPO_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# Удаление старого origin если есть
if git remote | grep -q "^origin$"; then
    print_info "Удаление старого remote origin..."
    git remote remove origin
fi

# Добавление нового origin
git remote add origin "$REPO_URL"

print_success "Remote origin настроен!"

# ═══════════════════════════════════════════════════════════════
# ШАГ 7: ЗАГРУЗКА НА GITHUB
# ═══════════════════════════════════════════════════════════════
print_step "Шаг 7/7: Загрузка кода на GitHub"

print_info "Загружаю код на GitHub..."

# Проверка основной ветки
BRANCH=$(git branch --show-current)
if [ -z "$BRANCH" ]; then
    BRANCH="main"
    git checkout -b main
fi

# Push с токеном
if git push -u origin "$BRANCH" --force; then
    print_success "Код успешно загружен на GitHub!"
else
    print_error "Ошибка при загрузке. Проверьте токен и права доступа."
    exit 1
fi

# ═══════════════════════════════════════════════════════════════
# ФИНАЛЬНОЕ СООБЩЕНИЕ
# ═══════════════════════════════════════════════════════════════

echo -e "\n${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              ✅ ЗАГРУЗКА ЗАВЕРШЕНА УСПЕШНО! ✅             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

echo -e "${BLUE}🌐 Ваш репозиторий:${NC}"
echo -e "${PURPLE}   https://github.com/${GITHUB_USERNAME}/${REPO_NAME}${NC}\n"

echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo -e "${YELLOW}   1. Откройте репозиторий в браузере${NC}"
echo -e "${YELLOW}   2. Настройте GitHub Pages (Settings → Pages)${NC}"
echo -e "${YELLOW}   3. Или разверните на Vercel/Netlify${NC}\n"

echo -e "${BLUE}📚 Полезные команды:${NC}"
echo -e "${YELLOW}   git status          ${NC}- Проверить статус"
echo -e "${YELLOW}   git add .           ${NC}- Добавить изменения"
echo -e "${YELLOW}   git commit -m \"...\" ${NC}- Создать коммит"
echo -e "${YELLOW}   git push            ${NC}- Загрузить изменения\n"

echo -e "${GREEN}🎉 Готово! Ваш проект теперь на GitHub! 🎉${NC}\n"
