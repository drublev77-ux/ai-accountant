#!/bin/bash

#######################################################
# Автоматическая синхронизация при изменениях файлов
# Использует inotifywait для мониторинга изменений
#######################################################

set -e

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Функции
log() { echo -e "${GREEN}[WATCH]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Настройки
WATCH_DIRS="src android/app/src ios/App public"
DEBOUNCE_SECONDS=3
LAST_SYNC=0

#######################################################
# Проверка зависимостей
#######################################################
check_dependencies() {
    # Проверка inotifywait (Linux)
    if command -v inotifywait >/dev/null 2>&1; then
        WATCH_TOOL="inotifywait"
        return 0
    fi
    
    # Проверка fswatch (macOS)
    if command -v fswatch >/dev/null 2>&1; then
        WATCH_TOOL="fswatch"
        return 0
    fi
    
    error "Необходимо установить inotifywait (Linux) или fswatch (macOS)"
    info "Ubuntu/Debian: sudo apt-get install inotify-tools"
    info "macOS: brew install fswatch"
    return 1
}

#######################################################
# Выполнение синхронизации с debounce
#######################################################
do_sync() {
    local current_time=$(date +%s)
    local time_diff=$((current_time - LAST_SYNC))
    
    # Debounce: игнорировать если прошло меньше N секунд
    if [ $time_diff -lt $DEBOUNCE_SECONDS ]; then
        return
    fi
    
    LAST_SYNC=$current_time
    
    echo ""
    log "Обнаружены изменения, запуск синхронизации..."
    
    # Запуск основного скрипта синхронизации
    if [ -f "./auto-sync.sh" ]; then
        ./auto-sync.sh --with-capacitor
    else
        warn "Скрипт auto-sync.sh не найден"
    fi
    
    echo ""
    info "Продолжаем мониторинг изменений..."
}

#######################################################
# Мониторинг с inotifywait (Linux)
#######################################################
watch_inotifywait() {
    log "Запуск мониторинга с inotifywait..."
    
    # Создаем массив директорий для мониторинга
    local watch_args=()
    for dir in $WATCH_DIRS; do
        if [ -d "$dir" ]; then
            watch_args+=("$dir")
        fi
    done
    
    if [ ${#watch_args[@]} -eq 0 ]; then
        error "Нет директорий для мониторинга"
        return 1
    fi
    
    info "Мониторинг директорий: ${watch_args[*]}"
    
    # Мониторинг изменений
    inotifywait -m -r -e modify,create,delete,move "${watch_args[@]}" |
    while read -r directory events filename; do
        # Игнорируем служебные файлы
        if [[ "$filename" =~ node_modules|\.git|dist|build|\.log$ ]]; then
            continue
        fi
        
        info "Изменен файл: $directory$filename"
        do_sync
    done
}

#######################################################
# Мониторинг с fswatch (macOS)
#######################################################
watch_fswatch() {
    log "Запуск мониторинга с fswatch..."
    
    local watch_args=()
    for dir in $WATCH_DIRS; do
        if [ -d "$dir" ]; then
            watch_args+=("$dir")
        fi
    done
    
    if [ ${#watch_args[@]} -eq 0 ]; then
        error "Нет директорий для мониторинга"
        return 1
    fi
    
    info "Мониторинг директорий: ${watch_args[*]}"
    
    fswatch -r \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='dist' \
        --exclude='build' \
        --exclude='\.log$' \
        "${watch_args[@]}" |
    while read -r changed_file; do
        info "Изменен файл: $changed_file"
        do_sync
    done
}

#######################################################
# Fallback: простой polling-based мониторинг
#######################################################
watch_polling() {
    warn "Использование простого polling-режима (менее эффективно)"
    info "Рекомендуется установить inotifywait или fswatch"
    
    local last_hash=""
    
    while true; do
        # Вычисляем хеш всех отслеживаемых файлов
        local current_hash=$(find src android/app/src ios/App public -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" 2>/dev/null | sort | xargs md5sum 2>/dev/null | md5sum)
        
        if [ -n "$last_hash" ] && [ "$current_hash" != "$last_hash" ]; then
            info "Обнаружены изменения"
            do_sync
        fi
        
        last_hash="$current_hash"
        sleep 5
    done
}

#######################################################
# Основная функция
#######################################################
main() {
    info "╔══════════════════════════════════════════════╗"
    info "║  АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ (WATCH MODE)   ║"
    info "╚══════════════════════════════════════════════╝"
    echo ""
    
    info "Нажмите Ctrl+C для остановки"
    echo ""
    
    # Начальная синхронизация
    do_sync
    
    # Проверка зависимостей и запуск соответствующего мониторинга
    if check_dependencies; then
        case "$WATCH_TOOL" in
            inotifywait)
                watch_inotifywait
                ;;
            fswatch)
                watch_fswatch
                ;;
        esac
    else
        # Fallback на polling
        watch_polling
    fi
}

# Обработка Ctrl+C
trap 'echo ""; log "Остановка мониторинга..."; exit 0' INT TERM

# Запуск
main "$@"
