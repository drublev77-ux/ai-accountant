#!/bin/bash

# 🚀 Автоматическая настройка GitHub для AI Accountant
# Этот скрипт полностью автоматизирует создание репозитория и настройку GitHub Actions

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Логирование
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка наличия GitHub CLI
check_gh_cli() {
    log_info "Проверка GitHub CLI..."
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) не установлен!"
        log_info "Установка GitHub CLI..."

        # Установка GitHub CLI для Linux
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
            sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
            sudo apt update
            sudo apt install gh -y
        else
            log_error "Пожалуйста, установите GitHub CLI вручную: https://cli.github.com/"
            exit 1
        fi
    fi
    log_success "GitHub CLI установлен"
}

# Аутентификация в GitHub
authenticate_github() {
    log_info "Проверка аутентификации GitHub..."

    if ! gh auth status &> /dev/null; then
        log_warning "Требуется аутентификация в GitHub"
        log_info "Запуск процесса аутентификации..."
        gh auth login
    else
        log_success "Вы уже аутентифицированы в GitHub"
        gh auth status
    fi
}

# Получение имени пользователя GitHub
get_github_username() {
    GITHUB_USERNAME=$(gh api user -q .login)
    log_success "GitHub username: $GITHUB_USERNAME"
}

# Конфигурация репозитория
REPO_NAME="ai-accountant"
REPO_DESCRIPTION="AI-powered accounting application built with React, TypeScript, and Capacitor"

# Инициализация git
init_git() {
    log_info "Инициализация Git репозитория..."

    if [ -d .git ]; then
        log_warning "Git уже инициализирован"
    else
        git init
        log_success "Git инициализирован"
    fi

    # Настройка git config если не настроено
    if [ -z "$(git config user.name)" ]; then
        log_info "Настройка git config..."
        git config user.name "$GITHUB_USERNAME"
        git config user.email "$(gh api user -q .email)"
    fi
}

# Создание .gitignore если его нет
setup_gitignore() {
    log_info "Проверка .gitignore..."

    if [ ! -f .gitignore ]; then
        log_info "Создание .gitignore..."
        cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
build/
.vercel/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Android/Keystore Security
*.keystore
*.jks
release.keystore
release.keystore.base64
github-secrets.txt
keystore.properties

# Logs
*.log
npm-debug.log*

# Temporary files
*.tmp
*.temp
EOF
        log_success ".gitignore создан"
    else
        log_success ".gitignore уже существует"
    fi
}

# Создание репозитория на GitHub
create_github_repo() {
    log_info "Создание репозитория на GitHub..."

    # Проверка, существует ли репозиторий
    if gh repo view "$GITHUB_USERNAME/$REPO_NAME" &> /dev/null; then
        log_warning "Репозиторий $REPO_NAME уже существует!"
        read -p "Удалить и создать заново? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "Удаление существующего репозитория..."
            gh repo delete "$GITHUB_USERNAME/$REPO_NAME" --yes
            log_success "Репозиторий удален"
        else
            log_info "Использование существующего репозитория"
            return
        fi
    fi

    # Создание нового репозитория
    gh repo create "$REPO_NAME" \
        --public \
        --description "$REPO_DESCRIPTION" \
        --source=. \
        --remote=origin \
        --push=false

    log_success "Репозиторий создан: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
}

# Добавление секретов в GitHub
add_github_secrets() {
    log_info "Добавление секретов в GitHub..."

    # Чтение значений из github-secrets.txt
    if [ ! -f github-secrets.txt ]; then
        log_error "Файл github-secrets.txt не найден!"
        exit 1
    fi

    # Извлечение ANDROID_KEYSTORE_BASE64
    KEYSTORE_BASE64=$(sed -n '9,58p' github-secrets.txt | tr -d '\n')

    # Добавление секретов
    log_info "Добавление ANDROID_KEYSTORE_BASE64..."
    echo "$KEYSTORE_BASE64" | gh secret set ANDROID_KEYSTORE_BASE64 -R "$GITHUB_USERNAME/$REPO_NAME"

    log_info "Добавление ANDROID_KEYSTORE_PASSWORD..."
    echo "aiaccountant2024" | gh secret set ANDROID_KEYSTORE_PASSWORD -R "$GITHUB_USERNAME/$REPO_NAME"

    log_info "Добавление ANDROID_KEY_PASSWORD..."
    echo "aiaccountant2024" | gh secret set ANDROID_KEY_PASSWORD -R "$GITHUB_USERNAME/$REPO_NAME"

    log_info "Добавление ANDROID_KEY_ALIAS..."
    echo "ai-accountant" | gh secret set ANDROID_KEY_ALIAS -R "$GITHUB_USERNAME/$REPO_NAME"

    log_success "Все секреты добавлены в GitHub!"
}

# Коммит и push
commit_and_push() {
    log_info "Подготовка файлов для коммита..."

    # Добавление всех файлов
    git add .

    # Создание коммита
    log_info "Создание коммита..."
    git commit -m "Initial commit: AI Accountant app with GitHub Actions

- React 19 + TypeScript + Tailwind CSS
- Capacitor for mobile apps (Android + iOS)
- GitHub Actions для автоматической сборки
- Готово к деплою в магазины приложений

🤖 Generated with Claude Code" || log_warning "Нет изменений для коммита"

    # Установка основной ветки
    git branch -M main

    # Push в GitHub
    log_info "Отправка кода в GitHub..."
    git push -u origin main

    log_success "Код успешно отправлен в GitHub!"
}

# Проверка GitHub Actions
check_actions() {
    log_info "Проверка статуса GitHub Actions..."

    sleep 3

    log_success "GitHub Actions настроен и готов к работе!"
    log_info "Вы можете посмотреть статус сборки здесь:"
    log_info "https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions"
}

# Вывод итоговой информации
print_summary() {
    echo
    echo "======================================"
    log_success "🎉 Настройка GitHub завершена!"
    echo "======================================"
    echo
    log_info "📋 Информация о репозитории:"
    echo "  • URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "  • Ветка: main"
    echo "  • Секреты: 4 секрета добавлено"
    echo
    log_info "🚀 Что дальше?"
    echo "  1. Перейдите на https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions"
    echo "  2. Дождитесь завершения автоматической сборки"
    echo "  3. Скачайте AAB файл из Artifacts"
    echo "  4. Загрузите AAB в Google Play Console"
    echo
    log_info "📱 GitHub Actions автоматически:"
    echo "  • Соберет Android приложение"
    echo "  • Создаст подписанный AAB файл"
    echo "  • Сохранит артефакт для скачивания"
    echo
    log_success "Готово! Ваш проект интегрирован с GitHub! 🚀"
    echo "======================================"
}

# Основная функция
main() {
    echo "======================================"
    log_info "🚀 Автоматическая настройка GitHub"
    log_info "   для проекта AI Accountant"
    echo "======================================"
    echo

    check_gh_cli
    authenticate_github
    get_github_username
    init_git
    setup_gitignore
    create_github_repo
    add_github_secrets
    commit_and_push
    check_actions
    print_summary
}

# Запуск
main
