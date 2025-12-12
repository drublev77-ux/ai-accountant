#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# 🚀 АВТОМАТИЧЕСКОЕ СОЗДАНИЕ iOS И ANDROID ПРИЛОЖЕНИЙ
# ═══════════════════════════════════════════════════════════════════
# Этот скрипт полностью автоматизирует создание мобильных приложений
# для iOS (App Store) и Android (Google Play)
# ═══════════════════════════════════════════════════════════════════

set -e  # Остановить при первой ошибке

# Цвета для красивого вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Функция для красивого вывода
print_header() {
    echo -e "\n${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${WHITE}  $1${PURPLE}${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
    echo -e "${CYAN}➜${NC} ${WHITE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${WHITE}$1${NC}"
}

print_error() {
    echo -e "${RED}✗${NC} ${WHITE}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} ${WHITE}$1${NC}"
}

# Приветственное сообщение
clear
echo -e "${PURPLE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ██╗      █████╗  ██████╗ ███████╗██████╗ ███████╗ ║
║  ██╔════╝██╔╝     ██╔══██╗██╔════╝ ██╔════╝██╔══██╗██╔════╝ ║
║  ███████╗██║      ███████║██║  ███╗█████╗  ██████╔╝███████╗ ║
║  ╚════██║██║      ██╔══██║██║   ██║██╔══╝  ██╔══██╗╚════██║ ║
║  ██████╔╝███████╗██║  ██║╚██████╔╝███████╗██║  ██║███████║ ║
║  ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝ ║
║                                                               ║
║          🚀 АВТОМАТИЧЕСКОЕ СОЗДАНИЕ МОБИЛЬНЫХ ПРИЛОЖЕНИЙ     ║
║               iOS (App Store) + Android (Google Play)        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

print_header "ШАГ 1/6: ПРОВЕРКА СИСТЕМЫ"

# Проверка Node.js
print_step "Проверка Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js установлен: $NODE_VERSION"
else
    print_error "Node.js не установлен!"
    echo "Установите Node.js с https://nodejs.org/"
    exit 1
fi

# Проверка npm
print_step "Проверка npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm установлен: $NPM_VERSION"
else
    print_error "npm не установлен!"
    exit 1
fi

print_header "ШАГ 2/6: УСТАНОВКА CAPACITOR"

print_step "Устанавливаем Capacitor CLI и зависимости..."
npm install --save @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard @capacitor/push-notifications

print_success "Capacitor установлен!"

print_header "ШАГ 3/6: СБОРКА WEB ПРИЛОЖЕНИЯ"

print_step "Собираем production версию веб-приложения..."
npm run build

print_success "Веб-приложение собрано в папку dist/"

print_header "ШАГ 4/6: ИНИЦИАЛИЗАЦИЯ CAPACITOR"

# Проверяем, инициализирован ли уже Capacitor
if [ ! -d "ios" ] && [ ! -d "android" ]; then
    print_step "Инициализируем Capacitor проект..."
    npx cap init "AI Accountant" "com.ai.accountant" --web-dir=dist
    print_success "Capacitor проект инициализирован!"
else
    print_warning "Capacitor уже инициализирован, пропускаем..."
fi

print_header "ШАГ 5/6: СОЗДАНИЕ ПЛАТФОРМ iOS И ANDROID"

# Создание iOS проекта
if [ ! -d "ios" ]; then
    print_step "Создаем iOS проект..."
    npx cap add ios
    print_success "iOS проект создан в папке ios/"
else
    print_warning "iOS проект уже существует"
    print_step "Обновляем iOS проект..."
    npx cap sync ios
    print_success "iOS проект обновлен!"
fi

# Создание Android проекта
if [ ! -d "android" ]; then
    print_step "Создаем Android проект..."
    npx cap add android
    print_success "Android проект создан в папке android/"
else
    print_warning "Android проект уже существует"
    print_step "Обновляем Android проект..."
    npx cap sync android
    print_success "Android проект обновлен!"
fi

print_header "ШАГ 6/6: КОПИРОВАНИЕ WEB РЕСУРСОВ"

print_step "Синхронизируем веб-ресурсы с мобильными приложениями..."
npx cap sync

print_success "Все ресурсы синхронизированы!"

# Финальное сообщение
print_header "✨ ГОТОВО! МОБИЛЬНЫЕ ПРИЛОЖЕНИЯ СОЗДАНЫ!"

echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                    ✅ ВСЁ ГОТОВО!                             ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${WHITE}📱 СОЗДАНЫ ПРОЕКТЫ:${NC}\n"
echo -e "  ${CYAN}📂 ios/${NC}       - iOS приложение (Xcode проект)"
echo -e "  ${CYAN}📂 android/${NC}   - Android приложение (Android Studio проект)\n"

echo -e "${WHITE}🚀 ЧТО ДЕЛАТЬ ДАЛЬШЕ:${NC}\n"

echo -e "${YELLOW}═══ ДЛЯ iOS (App Store) ═══${NC}\n"
echo -e "  ${CYAN}1.${NC} Откройте проект в Xcode:"
echo -e "     ${GREEN}npx cap open ios${NC}\n"
echo -e "  ${CYAN}2.${NC} В Xcode:"
echo -e "     • Войдите в свой Apple Developer аккаунт"
echo -e "     • Выберите Team в Signing & Capabilities"
echo -e "     • Измените Bundle Identifier если нужно\n"
echo -e "  ${CYAN}3.${NC} Соберите для App Store:"
echo -e "     • Product → Archive"
echo -e "     • Distribute App → App Store Connect\n"

echo -e "${YELLOW}═══ ДЛЯ ANDROID (Google Play) ═══${NC}\n"
echo -e "  ${CYAN}1.${NC} Откройте проект в Android Studio:"
echo -e "     ${GREEN}npx cap open android${NC}\n"
echo -e "  ${CYAN}2.${NC} В Android Studio:"
echo -e "     • Build → Generate Signed Bundle / APK"
echo -e "     • Выберите Android App Bundle (.aab)"
echo -e "     • Создайте или выберите ключ подписи\n"
echo -e "  ${CYAN}3.${NC} Загрузите .aab файл в Google Play Console\n"

echo -e "${WHITE}📚 ПОДРОБНЫЕ ИНСТРУКЦИИ:${NC}\n"
echo -e "  ${CYAN}•${NC} iOS:     ${GREEN}cat ПУБЛИКАЦИЯ_IOS_ДЕТАЛЬНО.md${NC}"
echo -e "  ${CYAN}•${NC} Android: ${GREEN}cat ПУБЛИКАЦИЯ_ANDROID_ДЕТАЛЬНО.md${NC}"
echo -e "  ${CYAN}•${NC} Полная:  ${GREEN}cat МОБИЛЬНЫЕ_ПРИЛОЖЕНИЯ_ГОТОВО.md${NC}\n"

echo -e "${WHITE}⚡ БЫСТРЫЕ КОМАНДЫ:${NC}\n"
echo -e "  ${GREEN}npx cap open ios${NC}      - Открыть iOS в Xcode"
echo -e "  ${GREEN}npx cap open android${NC}  - Открыть Android в Android Studio"
echo -e "  ${GREEN}npm run build && npx cap sync${NC}  - Пересобрать и обновить"
echo -e "  ${GREEN}npx cap run ios${NC}       - Запустить на iOS симуляторе"
echo -e "  ${GREEN}npx cap run android${NC}   - Запустить на Android эмуляторе\n"

echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║${WHITE}  🎉 Ваши приложения готовы к публикации в магазинах!     ${PURPLE}║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}\n"
