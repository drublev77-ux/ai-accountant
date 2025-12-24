#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# 🚀 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ AI БУХГАЛТЕРА
# ═══════════════════════════════════════════════════════════════

set -e  # Остановка при ошибке

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # Без цвета

# Функции для вывода
print_banner() {
    clear
    echo -e "${PURPLE}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🚀 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ AI БУХГАЛТЕРА 🚀        ║
║                                                           ║
║           GitHub → Vercel → Публичная ссылка             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
}

print_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "\n${GREEN}✅ $1${NC}\n"
}

print_error() {
    echo -e "\n${RED}❌ ОШИБКА: $1${NC}\n"
}

print_warning() {
    echo -e "\n${YELLOW}⚠️  $1${NC}\n"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Баннер
print_banner

# ═══════════════════════════════════════════════════════════════
# ШАГ 0: ПРОВЕРКА ЗАВИСИМОСТЕЙ
# ═══════════════════════════════════════════════════════════════

print_step "Шаг 0/6: Проверка зависимостей"

# Проверка git
if ! command -v git &> /dev/null; then
    print_error "Git не установлен. Установите git: https://git-scm.com/"
    exit 1
fi
print_success "Git установлен"

# Проверка gh CLI (опционально)
if command -v gh &> /dev/null; then
    print_success "GitHub CLI установлен"
    USE_GH_CLI=true
else
    print_warning "GitHub CLI не установлен (не критично)"
    print_info "Будет использован API напрямую"
    USE_GH_CLI=false
fi

# ═══════════════════════════════════════════════════════════════
# ШАГ 1: ПОЛУЧЕНИЕ GITHUB ТОКЕНА
# ═══════════════════════════════════════════════════════════════

print_step "Шаг 1/6: Проверка GitHub токена"

# Загрузка из .env.local
if [ -f .env.local ]; then
    source .env.local
fi

if [ -z "$GITHUB_TOKEN" ]; then
    print_warning "GitHub токен не найден в .env.local"
    echo ""
    echo -e "${CYAN}Для автоматического деплоя нужен GitHub Personal Access Token${NC}"
    echo ""
    echo "Как получить токен:"
    echo "1. Откройте: https://github.com/settings/tokens/new"
    echo "2. Права: repo (все), workflow"
    echo "3. Создайте токен и скопируйте его"
    echo ""
    read -p "Введите ваш GitHub токен (или Enter для пропуска): " GITHUB_TOKEN

    if [ -z "$GITHUB_TOKEN" ]; then
        print_error "Токен не введен. Автоматический деплой невозможен."
        echo ""
        echo -e "${YELLOW}Альтернативные варианты:${NC}"
        echo "1. Vercel Upload: https://vercel.com/new"
        echo "2. Netlify Drop: https://app.netlify.com/drop"
        echo ""
        exit 1
    fi

    # Сохранение токена
    echo "GITHUB_TOKEN=$GITHUB_TOKEN" > .env.local
    print_success "Токен сохранен в .env.local"
fi

# Проверка валидности токена
print_info "Проверка токена..."
GITHUB_USER=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -o '"login": *"[^"]*"' | cut -d'"' -f4)

if [ -z "$GITHUB_USER" ]; then
    print_error "Невалидный токен. Проверьте токен и попробуйте снова."
    exit 1
fi

print_success "Токен валиден. GitHub пользователь: $GITHUB_USER"

# ═══════════════════════════════════════════════════════════════
# ШАГ 2: НАСТРОЙКА GIT РЕПОЗИТОРИЯ
# ═══════════════════════════════════════════════════════════════

print_step "Шаг 2/6: Настройка Git репозитория"

REPO_NAME="ai-accountant"

# Инициализация git (если нужно)
if [ ! -d .git ]; then
    print_info "Инициализация Git..."
    git init
    git config user.name "$GITHUB_USER"
    git config user.email "$GITHUB_USER@users.noreply.github.com"
    print_success "Git инициализирован"
else
    print_success "Git уже инициализирован"
fi

# Добавление файлов
print_info "Добавление файлов..."
git add .
git commit -m "🎉 Автоматический деплой: AI Бухгалтер v1.0" || print_warning "Нет изменений для коммита"

# ═══════════════════════════════════════════════════════════════
# ШАГ 3: СОЗДАНИЕ GITHUB РЕПОЗИТОРИЯ
# ═══════════════════════════════════════════════════════════════

print_step "Шаг 3/6: Создание GitHub репозитория"

# Проверка, существует ли репозиторий
REPO_EXISTS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/$GITHUB_USER/$REPO_NAME" | grep -o '"full_name"')

if [ -n "$REPO_EXISTS" ]; then
    print_warning "Репозиторий $REPO_NAME уже существует"
    read -p "Использовать существующий репозиторий? (y/n): " USE_EXISTING

    if [[ ! $USE_EXISTING =~ ^[Yy]$ ]]; then
        print_error "Создание отменено. Удалите старый репозиторий или измените имя."
        exit 1
    fi
else
    print_info "Создание репозитория $REPO_NAME..."

    CREATE_RESPONSE=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user/repos \
        -d "{
            \"name\": \"$REPO_NAME\",
            \"description\": \"🧾 AI Бухгалтер - Умный помощник для учета расходов и доходов\",
            \"private\": false,
            \"auto_init\": false
        }")

    if echo "$CREATE_RESPONSE" | grep -q '"full_name"'; then
        print_success "Репозиторий создан: https://github.com/$GITHUB_USER/$REPO_NAME"
    else
        print_error "Не удалось создать репозиторий"
        echo "$CREATE_RESPONSE"
        exit 1
    fi
fi

# ═══════════════════════════════════════════════════════════════
# ШАГ 4: ЗАГРУЗКА КОДА НА GITHUB
# ═══════════════════════════════════════════════════════════════

print_step "Шаг 4/6: Загрузка кода на GitHub"

# Добавление remote (если нужно)
if ! git remote | grep -q origin; then
    git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"
    print_success "Remote добавлен"
fi

# Push
print_info "Загрузка файлов на GitHub..."
git branch -M main
git push -u origin main --force

print_success "Код загружен на GitHub!"
echo -e "${CYAN}📦 Репозиторий: https://github.com/$GITHUB_USER/$REPO_NAME${NC}"

# ═══════════════════════════════════════════════════════════════
# ШАГ 5: НАСТРОЙКА VERCEL
# ═══════════════════════════════════════════════════════════════

print_step "Шаг 5/6: Настройка Vercel"

echo -e "${YELLOW}Теперь нужно подключить GitHub к Vercel:${NC}"
echo ""
echo "1. Откройте: https://vercel.com/new"
echo "2. Войдите через GitHub"
echo "3. Найдите репозиторий: $GITHUB_USER/$REPO_NAME"
echo "4. Нажмите 'Import'"
echo "5. Настройки по умолчанию подходят - нажмите 'Deploy'"
echo ""
read -p "Нажмите Enter, когда деплой на Vercel будет готов..."

# ═══════════════════════════════════════════════════════════════
# ШАГ 6: ИТОГИ
# ═══════════════════════════════════════════════════════════════

print_step "Шаг 6/6: Деплой завершен!"

echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              🎉 ДЕПЛОЙ УСПЕШНО ЗАВЕРШЕН! 🎉             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

echo -e "${CYAN}📦 GitHub:${NC} https://github.com/$GITHUB_USER/$REPO_NAME"
echo -e "${CYAN}🚀 Vercel:${NC} Проверьте https://vercel.com/dashboard"
echo -e "${CYAN}🌐 Ваше приложение:${NC} https://$REPO_NAME.vercel.app (или custom URL от Vercel)"
echo ""
echo -e "${YELLOW}Что дальше:${NC}"
echo "1. ✅ Откройте ваше приложение по ссылке от Vercel"
echo "2. 📱 Поделитесь ссылкой с пользователями"
echo "3. 🔄 При каждом git push код автоматически обновится!"
echo ""
echo -e "${GREEN}Для обновления кода в будущем:${NC}"
echo "  ./update-github.sh \"Описание изменений\""
echo ""
print_success "ГОТОВО! Ваш AI Бухгалтер онлайн! 🚀"
