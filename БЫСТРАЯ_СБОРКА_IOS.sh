#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# 📱 БЫСТРАЯ СБОРКА iOS ПРОЕКТА
# ═══════════════════════════════════════════════════════════════════
# Автоматическая подготовка iOS проекта для App Store
# ═══════════════════════════════════════════════════════════════════

set -e

# Цвета
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${WHITE}  📱 АВТОМАТИЧЕСКАЯ СБОРКА iOS ПРОЕКТА             ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"

# Проверка macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${YELLOW}⚠${NC} ${WHITE}Внимание: iOS приложения можно собирать только на macOS!${NC}"
    echo -e "${WHITE}Этот скрипт подготовит проект, но для финальной сборки нужен Mac.${NC}\n"
fi

# Шаг 1: Сборка веб-приложения
echo -e "${CYAN}[1/4]${NC} ${WHITE}Собираем веб-приложение...${NC}"
npm run build
echo -e "${GREEN}✓${NC} Веб-приложение собрано!\n"

# Шаг 2: Синхронизация с iOS
echo -e "${CYAN}[2/4]${NC} ${WHITE}Синхронизируем с iOS проектом...${NC}"
npx cap sync ios
echo -e "${GREEN}✓${NC} Синхронизация завершена!\n"

# Шаг 3: Подготовка
echo -e "${CYAN}[3/4]${NC} ${WHITE}Подготовка проекта...${NC}"
if [ -d "ios/App" ]; then
    echo -e "${GREEN}✓${NC} iOS проект готов!\n"
else
    echo -e "${YELLOW}⚠${NC} iOS проект не найден. Создаем...\n"
    npx cap add ios
    npx cap sync ios
    echo -e "${GREEN}✓${NC} iOS проект создан!\n"
fi

# Шаг 4: Результат
echo -e "${CYAN}[4/4]${NC} ${WHITE}Готово!${NC}\n"

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${WHITE}  ✅ iOS ПРОЕКТ ГОТОВ К СБОРКЕ В XCODE!            ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${WHITE}📂 Проект:${NC} ios/App/App.xcworkspace\n"

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}🚀 СЛЕДУЮЩИЕ ШАГИ:${NC}\n"
    echo -e "${WHITE}1.${NC} Откройте Xcode:"
    echo -e "   ${GREEN}npx cap open ios${NC}\n"
    echo -e "${WHITE}2.${NC} В Xcode:"
    echo -e "   • Войдите в Apple Developer аккаунт"
    echo -e "   • Выберите Team в Signing & Capabilities"
    echo -e "   • Product → Archive"
    echo -e "   • Distribute App → App Store Connect\n"

    read -p "Открыть проект в Xcode сейчас? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx cap open ios
    fi
else
    echo -e "${YELLOW}⚠${NC} ${WHITE}Для продолжения перенесите проект на Mac и выполните:${NC}"
    echo -e "   ${GREEN}npx cap open ios${NC}\n"
fi
