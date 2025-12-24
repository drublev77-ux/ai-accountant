#!/bin/bash

# 🚀 Автоматическая настройка GitHub Auto Build
# Этот скрипт помогает настроить автосборку Android AAB через GitHub Actions

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 GitHub Auto Build Setup for AI Accountant ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# ========================
# Шаг 1: Проверка окружения
# ========================
echo -e "${YELLOW}[1/6]${NC} Проверка установленных инструментов..."

# Проверка Java/keytool
if command -v keytool &> /dev/null; then
    echo -e "${GREEN}✓${NC} keytool найден"
    KEYTOOL_VERSION=$(keytool -version 2>&1 | head -n 1)
    echo -e "   Версия: ${KEYTOOL_VERSION}"
else
    echo -e "${RED}✗${NC} keytool не найден!"
    echo -e "${YELLOW}   Установите JDK:${NC}"
    echo -e "   - macOS: brew install openjdk"
    echo -e "   - Ubuntu: sudo apt install default-jdk"
    echo -e "   - Windows: https://adoptium.net/"
    exit 1
fi

# Проверка git
if command -v git &> /dev/null; then
    echo -e "${GREEN}✓${NC} git найден"
else
    echo -e "${RED}✗${NC} git не найден!"
    exit 1
fi

# Проверка base64
if command -v base64 &> /dev/null; then
    echo -e "${GREEN}✓${NC} base64 найден"
else
    echo -e "${RED}✗${NC} base64 не найден!"
    exit 1
fi

echo ""

# ========================
# Шаг 2: Параметры keystore
# ========================
echo -e "${YELLOW}[2/6]${NC} Настройка параметров keystore..."

KEYSTORE_FILE="release.keystore"
KEY_ALIAS="ai-accountant"
STORE_PASSWORD="aiaccountant2024"
KEY_PASSWORD="aiaccountant2024"

echo -e "${GREEN}Параметры:${NC}"
echo -e "   Файл: ${KEYSTORE_FILE}"
echo -e "   Alias: ${KEY_ALIAS}"
echo -e "   Store Password: ${STORE_PASSWORD}"
echo -e "   Key Password: ${KEY_PASSWORD}"
echo ""

# ========================
# Шаг 3: Создание keystore
# ========================
echo -e "${YELLOW}[3/6]${NC} Создание Android keystore..."

if [ -f "${KEYSTORE_FILE}" ]; then
    echo -e "${YELLOW}⚠${NC} Keystore уже существует: ${KEYSTORE_FILE}"
    read -p "   Перезаписать? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}→${NC} Используем существующий keystore"
    else
        rm -f "${KEYSTORE_FILE}"
        echo -e "${BLUE}→${NC} Создаём новый keystore..."
        keytool -genkey -v \
            -keystore "${KEYSTORE_FILE}" \
            -alias "${KEY_ALIAS}" \
            -keyalg RSA \
            -keysize 2048 \
            -validity 10000 \
            -storepass "${STORE_PASSWORD}" \
            -keypass "${KEY_PASSWORD}" \
            -dname "CN=AI Accountant, OU=Development, O=AI Accountant Inc, L=San Francisco, S=California, C=US"
        echo -e "${GREEN}✓${NC} Keystore создан успешно!"
    fi
else
    echo -e "${BLUE}→${NC} Создаём новый keystore..."
    keytool -genkey -v \
        -keystore "${KEYSTORE_FILE}" \
        -alias "${KEY_ALIAS}" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass "${STORE_PASSWORD}" \
        -keypass "${KEY_PASSWORD}" \
        -dname "CN=AI Accountant, OU=Development, O=AI Accountant Inc, L=San Francisco, S=California, C=US"
    echo -e "${GREEN}✓${NC} Keystore создан успешно!"
fi

echo ""

# ========================
# Шаг 4: Конвертация в Base64
# ========================
echo -e "${YELLOW}[4/6]${NC} Конвертация keystore в Base64..."

BASE64_FILE="${KEYSTORE_FILE}.base64"
cat "${KEYSTORE_FILE}" | base64 > "${BASE64_FILE}"

LINES=$(wc -l < "${BASE64_FILE}" | tr -d ' ')
SIZE=$(wc -c < "${BASE64_FILE}" | tr -d ' ')

echo -e "${GREEN}✓${NC} Конвертация завершена!"
echo -e "   Файл: ${BASE64_FILE}"
echo -e "   Строк: ${LINES}"
echo -e "   Размер: ${SIZE} bytes"
echo ""

# ========================
# Шаг 5: Инструкции GitHub
# ========================
echo -e "${YELLOW}[5/6]${NC} Настройка GitHub Secrets..."
echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}СКОПИРУЙТЕ ЭТИ ЗНАЧЕНИЯ В GITHUB SECRETS:${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}1. ANDROID_KEYSTORE_BASE64${NC}"
echo -e "   Значение (скопируйте всё содержимое файла):"
echo -e "${YELLOW}   ↓↓↓ НАЧАЛО ↓↓↓${NC}"
cat "${BASE64_FILE}"
echo -e "${YELLOW}   ↑↑↑ КОНЕЦ ↑↑↑${NC}"
echo ""

echo -e "${GREEN}2. ANDROID_KEYSTORE_PASSWORD${NC}"
echo -e "   Значение: ${YELLOW}${STORE_PASSWORD}${NC}"
echo ""

echo -e "${GREEN}3. ANDROID_KEY_PASSWORD${NC}"
echo -e "   Значение: ${YELLOW}${KEY_PASSWORD}${NC}"
echo ""

echo -e "${GREEN}4. ANDROID_KEY_ALIAS${NC}"
echo -e "   Значение: ${YELLOW}${KEY_ALIAS}${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo ""

# Сохранение в файл для удобства
SECRETS_FILE="github-secrets.txt"
cat > "${SECRETS_FILE}" << EOF
GitHub Secrets для AI Accountant
================================

Перейдите в Settings → Secrets and variables → Actions
Добавьте следующие секреты:

1. ANDROID_KEYSTORE_BASE64
   Значение:
$(cat "${BASE64_FILE}")

2. ANDROID_KEYSTORE_PASSWORD
   Значение: ${STORE_PASSWORD}

3. ANDROID_KEY_PASSWORD
   Значение: ${KEY_PASSWORD}

4. ANDROID_KEY_ALIAS
   Значение: ${KEY_ALIAS}

================================
Дата создания: $(date)
EOF

echo -e "${GREEN}✓${NC} Секреты сохранены в файл: ${YELLOW}${SECRETS_FILE}${NC}"
echo ""

# ========================
# Шаг 6: Git инструкции
# ========================
echo -e "${YELLOW}[6/6]${NC} Загрузка на GitHub..."
echo ""
echo -e "${BLUE}Следующие шаги:${NC}"
echo ""
echo -e "${GREEN}1.${NC} Создайте репозиторий на GitHub:"
echo -e "   https://github.com/new"
echo ""
echo -e "${GREEN}2.${NC} Добавьте 4 секрета (см. выше или ${SECRETS_FILE})"
echo ""
echo -e "${GREEN}3.${NC} Выполните команды (замените ВАШ-ПОЛЬЗОВАТЕЛЬ):"
echo ""
echo -e "${YELLOW}   git remote add origin https://github.com/ВАШ-ПОЛЬЗОВАТЕЛЬ/ai-accountant.git${NC}"
echo -e "${YELLOW}   git push -u origin main${NC}"
echo ""
echo -e "${GREEN}4.${NC} GitHub Actions автоматически запустится!"
echo ""
echo -e "${GREEN}5.${NC} Скачайте AAB после сборки:"
echo -e "   GitHub → Actions → выберите run → Artifacts → android-release-aab"
echo ""

# ========================
# Финальные напоминания
# ========================
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║               ⚠️  ВАЖНАЯ БЕЗОПАСНОСТЬ          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${RED}✗${NC} НЕ коммитьте ${KEYSTORE_FILE} в git!"
echo -e "${RED}✗${NC} НЕ коммитьте ${BASE64_FILE} в git!"
echo -e "${RED}✗${NC} НЕ делитесь содержимым Base64!"
echo -e "${GREEN}✓${NC} .gitignore уже настроен"
echo -e "${GREEN}✓${NC} Сделайте backup ${KEYSTORE_FILE} в надёжное место"
echo ""

# ========================
# Сводка
# ========================
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  ✅ ГОТОВО!                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Созданные файлы:"
echo -e "  ${GREEN}✓${NC} ${KEYSTORE_FILE}"
echo -e "  ${GREEN}✓${NC} ${BASE64_FILE}"
echo -e "  ${GREEN}✓${NC} ${SECRETS_FILE}"
echo ""
echo -e "Следующий шаг: Настройте GitHub Secrets и выполните git push!"
echo ""
