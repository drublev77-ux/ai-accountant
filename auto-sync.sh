#!/bin/bash

#######################################
# Автоматическая синхронизация проекта
#######################################

set -e

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция логирования
log() {
    echo -e "${GREEN}[SYNC]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> sync.log
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $1" >> sync.log
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

#######################################
# Проверка Git репозитория
#######################################
check_git_repo() {
    if [ ! -d .git ]; then
        log "Инициализация Git репозитория..."
        git init
        git config user.name "E2B AI Agent"
        git config user.email "agent@e2b.dev"
    fi
}

#######################################
# Синхронизация с удаленным репозиторием
#######################################
sync_with_remote() {
    log "Начало синхронизации с удаленным репозиторием..."
    
    # Проверка наличия изменений
    if git diff --quiet && git diff --cached --quiet; then
        info "Нет изменений для коммита"
        
        # Попытка получить изменения с удаленного репозитория
        if git remote | grep -q origin; then
            log "Получение изменений с удаленного репозитория..."
            git pull --rebase origin main 2>/dev/null || git pull --rebase origin master 2>/dev/null || warn "Не удалось получить изменения"
        fi
        return 0
    fi
    
    # Добавление всех изменений
    log "Добавление изменений..."
    git add -A
    
    # Создание коммита
    COMMIT_MSG="Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
    log "Создание коммита: $COMMIT_MSG"
    git commit -m "$COMMIT_MSG" || warn "Нет изменений для коммита"
    
    # Отправка на удаленный репозиторий (если настроен)
    if git remote | grep -q origin; then
        log "Отправка изменений на удаленный репозиторий..."
        git push origin HEAD 2>/dev/null || {
            warn "Не удалось отправить изменения. Возможно, нужно сначала настроить удаленный репозиторий."
            info "Используйте: git remote add origin <URL>"
        }
    else
        info "Удаленный репозиторий не настроен"
        info "Для настройки используйте: git remote add origin <URL>"
    fi
}

#######################################
# Синхронизация Capacitor проекта
#######################################
sync_capacitor() {
    log "Синхронизация Capacitor проекта..."
    
    if [ -f "capacitor.config.json" ] || [ -f "capacitor.config.ts" ]; then
        if command -v npx >/dev/null 2>&1; then
            log "Запуск npx cap sync..."
            npx cap sync || warn "Ошибка при синхронизации Capacitor"
        else
            warn "npx не найден, пропуск Capacitor sync"
        fi
    else
        info "Capacitor не настроен в этом проекте"
    fi
}

#######################################
# Основная функция
#######################################
main() {
    info "╔════════════════════════════════════════╗"
    info "║  АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ ПРОЕКТА  ║"
    info "╚════════════════════════════════════════╝"
    echo ""
    
    # Проверка Git
    check_git_repo
    
    # Синхронизация с Git
    sync_with_remote
    
    # Синхронизация Capacitor (если нужно)
    if [ "$1" = "--with-capacitor" ] || [ "$1" = "-c" ]; then
        sync_capacitor
    fi
    
    echo ""
    log "✅ Синхронизация завершена!"
    echo ""
    info "Логи сохранены в: sync.log"
}

# Запуск
main "$@"
