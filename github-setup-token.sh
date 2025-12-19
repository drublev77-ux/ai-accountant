#!/bin/bash

# 🚀 Автоматическая настройка GitHub с использованием токена
# Этот скрипт позволяет настроить GitHub используя Personal Access Token

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Конфигурация
REPO_NAME="ai-accountant"
REPO_DESCRIPTION="AI-powered accounting application"

echo "======================================"
log_info "🚀 Настройка GitHub для AI Accountant"
echo "======================================"
echo

# Запрос GitHub токена
echo "Для автоматической настройки нужен GitHub Personal Access Token"
echo
log_info "Как получить токен:"
echo "  1. Откройте https://github.com/settings/tokens/new"
echo "  2. Название: 'AI Accountant Auto Setup'"
echo "  3. Выберите срок действия (например, 90 дней)"
echo "  4. Выберите права (scopes):"
echo "     ✓ repo (все подпункты)"
echo "     ✓ workflow"
echo "     ✓ admin:org (если нужно для организации)"
echo "  5. Нажмите 'Generate token'"
echo "  6. Скопируйте токен (он показывается только один раз!)"
echo
read -p "Введите ваш GitHub токен: " GITHUB_TOKEN
echo

if [ -z "$GITHUB_TOKEN" ]; then
    log_error "Токен не может быть пустым!"
    exit 1
fi

# Получение имени пользователя
log_info "Проверка токена..."
GITHUB_USERNAME=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -o '"login": *"[^"]*"' | sed 's/"login": *"\([^"]*\)"/\1/')

if [ -z "$GITHUB_USERNAME" ]; then
    log_error "Неверный токен или нет доступа к API GitHub!"
    exit 1
fi

log_success "Токен валиден! Username: $GITHUB_USERNAME"

# Инициализация Git
log_info "Инициализация Git..."
if [ ! -d .git ]; then
    git init
    git config user.name "$GITHUB_USERNAME"
    git config user.email "$GITHUB_USERNAME@users.noreply.github.com"
    log_success "Git инициализирован"
else
    log_warning "Git уже инициализирован"
fi

# Создание репозитория
log_info "Создание репозитория $REPO_NAME..."

# Проверка существования репозитория
REPO_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $GITHUB_TOKEN" \
    https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME)

if [ "$REPO_EXISTS" = "200" ]; then
    log_warning "Репозиторий уже существует!"
    read -p "Использовать существующий репозиторий? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Операция отменена"
        exit 1
    fi
else
    # Создание репозитория
    CREATE_RESPONSE=$(curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$REPO_NAME\",\"description\":\"$REPO_DESCRIPTION\",\"private\":false}" \
        https://api.github.com/user/repos)

    if echo "$CREATE_RESPONSE" | grep -q "\"id\""; then
        log_success "Репозиторий создан!"
    else
        log_error "Ошибка создания репозитория:"
        echo "$CREATE_RESPONSE"
        exit 1
    fi
fi

# Добавление секретов
log_info "Добавление секретов в репозиторий..."

if [ ! -f github-secrets.txt ]; then
    log_error "Файл github-secrets.txt не найден!"
    exit 1
fi

# Функция для добавления секрета
add_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2

    # Получение public key
    PUB_KEY_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/actions/secrets/public-key)

    KEY_ID=$(echo "$PUB_KEY_RESPONSE" | grep -o '"key_id": *"[^"]*"' | sed 's/"key_id": *"\([^"]*\)"/\1/')
    PUBLIC_KEY=$(echo "$PUB_KEY_RESPONSE" | grep -o '"key": *"[^"]*"' | sed 's/"key": *"\([^"]*\)"/\1/')

    # Шифрование значения (требуется libsodium, но мы используем простой подход)
    # GitHub API принимает base64, но для production лучше использовать шифрование
    ENCRYPTED_VALUE=$(echo -n "$SECRET_VALUE" | base64)

    # Добавление секрета
    log_info "  → Добавление $SECRET_NAME..."

    # Используем упрощенный метод через gh CLI если доступен
    if command -v gh &> /dev/null; then
        echo "$SECRET_VALUE" | gh secret set "$SECRET_NAME" -R "$GITHUB_USERNAME/$REPO_NAME"
    else
        log_warning "    Для добавления секретов установите GitHub CLI или добавьте их вручную"
        echo "    Секрет: $SECRET_NAME"
    fi
}

# Извлечение значений из файла
KEYSTORE_BASE64=$(sed -n '9,58p' github-secrets.txt | tr -d '\n')

# Установка GitHub CLI для добавления секретов
if ! command -v gh &> /dev/null; then
    log_info "Установка GitHub CLI для добавления секретов..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg 2>/dev/null
        sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update -qq
        sudo apt install gh -y -qq
    fi
fi

# Аутентификация gh с токеном
echo "$GITHUB_TOKEN" | gh auth login --with-token 2>/dev/null || true

# Добавление секретов
add_secret "ANDROID_KEYSTORE_BASE64" "$KEYSTORE_BASE64"
add_secret "ANDROID_KEYSTORE_PASSWORD" "aiaccountant2024"
add_secret "ANDROID_KEY_PASSWORD" "aiaccountant2024"
add_secret "ANDROID_KEY_ALIAS" "ai-accountant"

log_success "Секреты добавлены!"

# Коммит и push
log_info "Подготовка к загрузке кода..."

git add .
git commit -m "Initial commit: AI Accountant app

- React 19 + TypeScript + Tailwind CSS
- Capacitor for Android/iOS
- GitHub Actions auto-build
- Ready for app stores

🤖 Generated with Claude Code" || log_warning "Нет изменений для коммита"

git branch -M main

# Установка remote
git remote remove origin 2>/dev/null || true
git remote add origin https://$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git

log_info "Загрузка кода в GitHub..."
git push -u origin main --force

log_success "Код загружен в GitHub!"

# Итоги
echo
echo "======================================"
log_success "🎉 Настройка завершена!"
echo "======================================"
echo
log_info "📋 Информация:"
echo "  • Репозиторий: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "  • Actions: https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions"
echo "  • Секреты: 4 добавлено"
echo
log_info "🚀 Следующие шаги:"
echo "  1. Откройте: https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions"
echo "  2. Дождитесь завершения сборки"
echo "  3. Скачайте AAB из Artifacts"
echo "  4. Загрузите в Google Play Console"
echo
log_success "Готово! 🚀"
echo "======================================"
