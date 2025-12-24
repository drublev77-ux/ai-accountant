#!/bin/bash

#######################################################
# Unified Sync - Объединённая система синхронизации
# Git + Android Studio + Capacitor
#######################################################

set -e

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Функции
log() { echo -e "${GREEN}[UNIFIED]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
success() { echo -e "${CYAN}[✓]${NC} $1"; }
section() { echo -e "${MAGENTA}[═══]${NC} $1"; }

# Файл логов
LOG_FILE="unified-sync.log"
WATCH_INTERVAL=5
LAST_SYNC_TIME=0
DEBOUNCE_SECONDS=3

#######################################################
# Логирование в файл
#######################################################
log_to_file() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

#######################################################
# Git синхронизация
#######################################################
sync_git() {
    section "Git Sync"
    log_to_file "Начало Git синхронизации..."

    # Проверка Git репозитория
    if [ ! -d ".git" ]; then
        info "Инициализация Git репозитория..."
        git init
        log_to_file "Git репозиторий инициализирован"
    fi

    # Проверка изменений
    if git diff --quiet && git diff --cached --quiet; then
        info "Нет изменений для коммита"
        return 0
    fi

    # Добавление и коммит
    git add -A
    local commit_msg="Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$commit_msg" >/dev/null 2>&1 || info "Нечего коммитить"

    # Push если настроен remote
    if git remote | grep -q origin; then
        info "Отправка в GitHub..."
        git push origin HEAD 2>/dev/null || warn "Push failed (проверьте настройки remote)"
    else
        warn "Git remote не настроен. Запустите: git remote add origin <URL>"
    fi

    success "Git синхронизация завершена"
    log_to_file "Git синхронизация завершена"
}

#######################################################
# Capacitor синхронизация
#######################################################
sync_capacitor() {
    section "Capacitor Sync"
    log_to_file "Начало Capacitor синхронизации..."

    if ! command -v npx >/dev/null 2>&1; then
        warn "npx не найден, пропуск Capacitor sync"
        return 0
    fi

    info "Запуск npx cap sync..."
    npx cap sync android --no-build 2>/dev/null || warn "Capacitor sync warning (это нормально если нет dist)"

    success "Capacitor синхронизация завершена"
    log_to_file "Capacitor синхронизация завершена"
}

#######################################################
# Android Studio синхронизация
#######################################################
sync_android_studio() {
    section "Android Studio Sync"

    # Используем упрощенную версию без rsync
    if [ -f "android-studio-sync-simple.sh" ]; then
        info "Синхронизация с Android Studio (упрощенная версия)..."
        ./android-studio-sync-simple.sh sync 2>/dev/null || warn "AS синхронизация пропущена"
    elif [ -f "android-studio-sync.sh" ]; then
        if ! command -v rsync >/dev/null 2>&1; then
            warn "rsync не установлен, пропуск AS синхронизации"
            info "Используйте android-studio-sync-simple.sh для синхронизации без rsync"
            return 0
        fi

        if [ ! -f ".android-studio-sync.conf" ]; then
            info "Первый запуск - настройка Android Studio синхронизации"
            ./android-studio-sync.sh sync
        else
            info "Синхронизация с Android Studio..."
            ./android-studio-sync.sh sync
        fi
    else
        warn "Скрипты синхронизации не найдены, пропуск AS синхронизации"
        return 0
    fi

    success "Android Studio синхронизация завершена"
    log_to_file "Android Studio синхронизация завершена"
}

#######################################################
# Полная синхронизация
#######################################################
full_sync() {
    local current_time=$(date +%s)
    local time_diff=$((current_time - LAST_SYNC_TIME))

    # Debounce
    if [ $time_diff -lt $DEBOUNCE_SECONDS ]; then
        return 0
    fi

    LAST_SYNC_TIME=$current_time

    log "════════════════════════════════════════════════"
    log "  ПОЛНАЯ СИНХРОНИЗАЦИЯ"
    log "════════════════════════════════════════════════"
    echo ""

    log_to_file "=== Начало полной синхронизации ==="

    # 1. Android Studio синхронизация (двунаправленная)
    sync_android_studio

    # 2. Capacitor синхронизация
    sync_capacitor

    # 3. Git синхронизация
    sync_git

    echo ""
    success "═══════════════════════════════════════════════"
    success "  СИНХРОНИЗАЦИЯ ЗАВЕРШЕНА УСПЕШНО!"
    success "═══════════════════════════════════════════════"
    echo ""

    log_to_file "=== Синхронизация завершена ==="
}

#######################################################
# Получение хеша изменений
#######################################################
get_changes_hash() {
    find src android/app/src public -type f \
        \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" -o -name "*.xml" -o -name "*.gradle" \) \
        -exec md5sum {} \; 2>/dev/null | sort | md5sum | cut -d' ' -f1
}

#######################################################
# Режим мониторинга
#######################################################
watch_mode() {
    log "╔═══════════════════════════════════════════════════╗"
    log "║  UNIFIED SYNC - АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ      ║"
    log "╠═══════════════════════════════════════════════════╣"
    log "║  • Git синхронизация (GitHub)                     ║"
    log "║  • Android Studio синхронизация (двунаправленная) ║"
    log "║  • Capacitor синхронизация                        ║"
    log "╚═══════════════════════════════════════════════════╝"
    echo ""
    info "Интервал проверки: ${WATCH_INTERVAL}s"
    info "Логи записываются в: $LOG_FILE"
    info "Нажмите Ctrl+C для остановки"
    echo ""

    # Начальная синхронизация
    full_sync

    # Хеш для отслеживания изменений
    local last_hash=$(get_changes_hash)

    # Цикл мониторинга
    info "Мониторинг изменений запущен..."
    while true; do
        sleep "$WATCH_INTERVAL"

        local current_hash=$(get_changes_hash)

        if [ "$last_hash" != "$current_hash" ]; then
            info "Обнаружены изменения в проекте"
            full_sync
            last_hash=$(get_changes_hash)
        fi
    done
}

#######################################################
# Статус системы
#######################################################
show_status() {
    log "╔═══════════════════════════════════════════════════╗"
    log "║  СТАТУС СИНХРОНИЗАЦИИ                             ║"
    log "╚═══════════════════════════════════════════════════╝"
    echo ""

    # Git статус
    section "Git"
    if [ -d ".git" ]; then
        success "Репозиторий инициализирован"
        if git remote | grep -q origin; then
            local remote_url=$(git remote get-url origin)
            info "Remote: $remote_url"
        else
            warn "Remote не настроен"
        fi

        local branch=$(git branch --show-current)
        info "Текущая ветка: $branch"

        local uncommitted=$(git status --porcelain | wc -l)
        if [ "$uncommitted" -gt 0 ]; then
            warn "Незакоммиченных изменений: $uncommitted"
        else
            success "Нет незакоммиченных изменений"
        fi
    else
        warn "Git репозиторий не инициализирован"
    fi

    echo ""

    # Android Studio статус
    section "Android Studio"
    if [ -f ".android-studio-sync.conf" ]; then
        source ".android-studio-sync.conf"
        success "Синхронизация настроена"
        info "Проект: $ANDROID_STUDIO_PROJECT"

        if [ -d "$ANDROID_STUDIO_PROJECT" ]; then
            success "Проект найден"
        else
            warn "Проект не найден по указанному пути"
        fi
    else
        warn "Android Studio синхронизация не настроена"
        info "Запустите: ./unified-sync.sh sync"
    fi

    echo ""

    # Capacitor статус
    section "Capacitor"
    if [ -f "capacitor.config.json" ]; then
        success "Capacitor настроен"
        local app_id=$(grep -o '"appId":\s*"[^"]*"' capacitor.config.json | cut -d'"' -f4)
        info "App ID: $app_id"
    else
        warn "Capacitor не настроен"
    fi

    echo ""

    # Процессы мониторинга
    section "Процессы"
    local watch_processes=$(ps aux | grep -E "unified-sync.sh watch|android-studio-sync.sh watch" | grep -v grep | wc -l)
    if [ "$watch_processes" -gt 0 ]; then
        success "Активных процессов мониторинга: $watch_processes"
    else
        warn "Процессы мониторинга не запущены"
        info "Запустите: ./unified-sync.sh watch"
    fi

    echo ""

    # Последние логи
    section "Последние события"
    if [ -f "$LOG_FILE" ]; then
        tail -n 5 "$LOG_FILE"
    else
        info "Лог файл пуст"
    fi
}

#######################################################
# Главная функция
#######################################################
main() {
    case "${1:-sync}" in
        watch)
            watch_mode
            ;;
        sync)
            full_sync
            ;;
        status)
            show_status
            ;;
        git)
            sync_git
            ;;
        capacitor|cap)
            sync_capacitor
            ;;
        android-studio|as)
            sync_android_studio
            ;;
        help|--help|-h)
            echo "Unified Sync - Объединённая система синхронизации"
            echo ""
            echo "Использование: $0 [команда]"
            echo ""
            echo "Команды:"
            echo "  watch            - Автоматический мониторинг и синхронизация (рекомендуется)"
            echo "  sync             - Однократная полная синхронизация (по умолчанию)"
            echo "  status           - Показать статус всех систем"
            echo "  git              - Только Git синхронизация"
            echo "  capacitor (cap)  - Только Capacitor синхронизация"
            echo "  android-studio (as) - Только Android Studio синхронизация"
            echo "  help             - Показать эту справку"
            echo ""
            echo "Примеры:"
            echo "  $0               # Разовая синхронизация"
            echo "  $0 watch         # Запустить автомониторинг"
            echo "  $0 status        # Проверить статус"
            ;;
        *)
            error "Неизвестная команда: $1"
            echo "Используйте: $0 help"
            exit 1
            ;;
    esac
}

# Обработка сигналов
trap 'echo ""; log "Остановка мониторинга..."; exit 0' INT TERM

# Запуск
main "$@"
