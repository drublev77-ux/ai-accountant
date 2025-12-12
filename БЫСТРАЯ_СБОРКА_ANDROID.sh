#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# 🤖 БЫСТРАЯ СБОРКА ANDROID APP BUNDLE (.aab)
# ═══════════════════════════════════════════════════════════════════
# Автоматическая сборка готового .aab файла для Google Play
# ═══════════════════════════════════════════════════════════════════

set -e

# Цвета
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${WHITE}  🤖 АВТОМАТИЧЕСКАЯ СБОРКА ANDROID APP BUNDLE      ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"

# Шаг 1: Сборка веб-приложения
echo -e "${CYAN}[1/4]${NC} ${WHITE}Собираем веб-приложение...${NC}"
npm run build
echo -e "${GREEN}✓${NC} Веб-приложение собрано!\n"

# Шаг 2: Синхронизация с Android
echo -e "${CYAN}[2/4]${NC} ${WHITE}Синхронизируем с Android проектом...${NC}"
npx cap sync android
echo -e "${GREEN}✓${NC} Синхронизация завершена!\n"

# Шаг 3: Сборка App Bundle
echo -e "${CYAN}[3/4]${NC} ${WHITE}Собираем App Bundle (.aab)...${NC}"
cd android
./gradlew bundleRelease
cd ..
echo -e "${GREEN}✓${NC} App Bundle собран!\n"

# Шаг 4: Результат
echo -e "${CYAN}[4/4]${NC} ${WHITE}Готово!${NC}\n"

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
    exit 1
fi
