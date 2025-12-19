#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# 🤖 АВТОМАТИЧЕСКАЯ СБОРКА ANDROID ПРИЛОЖЕНИЯ
# ═══════════════════════════════════════════════════════════════════

set -e

# Цвета
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${WHITE}  🤖 АВТОМАТИЧЕСКАЯ СБОРКА ANDROID ПРИЛОЖЕНИЯ      ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"

# Проверка окружения
echo -e "${CYAN}[0/5]${NC} ${WHITE}Проверка окружения...${NC}"
echo -e "Node: $(node --version)"
echo -e "npm: $(npm --version)"
echo -e "${GREEN}✓${NC} Окружение готово!\n"

# Шаг 1: Сборка веб-приложения
echo -e "${CYAN}[1/5]${NC} ${WHITE}Собираем веб-приложение...${NC}"
npm run build
echo -e "${GREEN}✓${NC} Веб-приложение собрано!\n"

# Шаг 2: Проверка/создание Android проекта
echo -e "${CYAN}[2/5]${NC} ${WHITE}Проверка Android проекта...${NC}"
if [ ! -d "android" ]; then
    echo -e "${YELLOW}⚠${NC} Android проект не найден. Создаем..."
    npx cap add android
    echo -e "${GREEN}✓${NC} Android проект создан!"
else
    echo -e "${GREEN}✓${NC} Android проект уже существует!"
fi
echo ""

# Шаг 3: Синхронизация с Android
echo -e "${CYAN}[3/5]${NC} ${WHITE}Синхронизируем с Android проектом...${NC}"
npx cap sync android
echo -e "${GREEN}✓${NC} Синхронизация завершена!\n"

# Шаг 4: Проверка Gradle wrapper
echo -e "${CYAN}[4/5]${NC} ${WHITE}Проверка Gradle wrapper...${NC}"
cd android
if [ ! -f "gradlew" ]; then
    echo -e "${RED}✗${NC} Gradle wrapper не найден!"
    echo -e "${YELLOW}⚠${NC} Необходимо установить Android Studio для сборки .aab файла"
    cd ..
    exit 1
fi
chmod +x gradlew
echo -e "${GREEN}✓${NC} Gradle wrapper готов!\n"

# Шаг 5: Сборка App Bundle
echo -e "${CYAN}[5/5]${NC} ${WHITE}Собираем App Bundle (.aab)...${NC}"
./gradlew bundleRelease
cd ..
echo -e "${GREEN}✓${NC} App Bundle собран!\n"

# Результат
AAB_FILE="android/app/build/outputs/bundle/release/app-release.aab"

if [ -f "$AAB_FILE" ]; then
    FILE_SIZE=$(du -h "$AAB_FILE" | cut -f1)
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${WHITE}  ✅ APP BUNDLE ГОТОВ К ЗАГРУЗКЕ В GOOGLE PLAY!    ${GREEN}║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"
    echo -e "${WHITE}📦 Файл:${NC} $AAB_FILE"
    echo -e "${WHITE}📏 Размер:${NC} $FILE_SIZE\n"
    echo -e "${YELLOW}🚀 СЛЕДУЮЩИЙ ШАГ:${NC}"
    echo -e "   1. Откройте https://play.google.com/console/"
    echo -e "   2. Production → Create new release"
    echo -e "   3. Загрузите файл: $AAB_FILE\n"
else
    echo -e "${RED}✗ Ошибка: App Bundle не найден!${NC}"
    echo -e "${YELLOW}⚠${NC} Проверьте логи сборки выше"
    exit 1
fi
