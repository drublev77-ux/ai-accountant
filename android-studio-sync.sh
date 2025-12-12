#!/bin/bash

#######################################################
# Автоматическая синхронизация с Android Studio
# Двунаправленная синхронизация с автоопределением
#######################################################

set -e

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Функции
log() { echo -e "${GREEN}[AS-SYNC]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
success() { echo -e "${CYAN}[✓]${NC} $1"; }

# Конфигурационный файл
CONFIG_FILE=".android-studio-sync.conf"
LOCK_FILE="/tmp/android-studio-sync.lock"

#######################################################
# Поиск Android Studio проекта
#######################################################
find_android_studio_project() {
    info "Поиск Android Studio проекта..."

    local search_paths=(
        "$HOME/AndroidStudioProjects"
        "$HOME/StudioProjects"
        "$HOME/Projects"
        "$HOME/Documents/AndroidStudioProjects"
        "$HOME/Desktop"
    )

    # Имя проекта из capacitor.config
    local project_name=$(grep -o '"appId":\s*"[^"]*"' capacitor.config.json | cut -d'"' -f4 | rev | cut -d'.' -f1 | rev)

    if [ -z "$project_name" ]; then
        project_name="ai-accountant"
    fi

    info "Ищем проект: $project_name"

    # Поиск по стандартным путям
    for base_path in "${search_paths[@]}"; do
        if [ -d "$base_path" ]; then
            # Поиск по имени
            local found_path=$(find "$base_path" -maxdepth 2 -type d -name "$project_name" 2>/dev/null | head -1)

            if [ -n "$found_path" ] && [ -f "$found_path/android/build.gradle" ]; then
                echo "$found_path"
                return 0
            fi

            # Поиск по наличию android/build.gradle
            found_path=$(find "$base_path" -maxdepth 3 -name "build.gradle" -path "*/android/build.gradle" 2>/dev/null | head -1 | xargs dirname | xargs dirname)

            if [ -n "$found_path" ] && [ -d "$found_path" ]; then
                echo "$found_path"
                return 0
            fi
        fi
    done

    return 1
}

#######################################################
# Создание/загрузка конфигурации
#######################################################
setup_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
        return 0
    fi

    log "Создание конфигурации автосинхронизации..."

    # Автопоиск проекта
    local as_project=$(find_android_studio_project)

    if [ -z "$as_project" ]; then
        warn "Android Studio проект не найден автоматически"
        info "Укажите путь к проекту вручную:"
        read -r -p "Путь к Android Studio проекту: " as_project
    else
        success "Найден проект: $as_project"
    fi

    # Сохранение конфигурации
    cat > "$CONFIG_FILE" << EOF
# Автоматически создано $(date)
ANDROID_STUDIO_PROJECT="$as_project"
SYNC_INTERVAL=5
AUTO_CAPACITOR_SYNC=true
WATCH_ANDROID_CHANGES=true
EXCLUDE_PATTERNS=".git|node_modules|dist|build|.gradle|.idea"
EOF

    success "Конфигурация сохранена в $CONFIG_FILE"
    source "$CONFIG_FILE"
}

#######################################################
# Получение хеша директории
#######################################################
get_dir_hash() {
    local dir="$1"
    local exclude="$2"

    find "$dir" -type f \
        ! -path "*/.git/*" \
        ! -path "*/node_modules/*" \
        ! -path "*/dist/*" \
        ! -path "*/build/*" \
        ! -path "*/.gradle/*" \
        ! -path "*/.idea/*" \
        -exec md5sum {} \; 2>/dev/null | sort | md5sum | cut -d' ' -f1
}

#######################################################
# Синхронизация Web -> Android Studio
#######################################################
sync_to_android_studio() {
    local source_dir="./android"
    local target_dir="$ANDROID_STUDIO_PROJECT/android"

    if [ ! -d "$target_dir" ]; then
        warn "Целевая директория не существует: $target_dir"
        return 1
    fi

    info "Синхронизация Web → Android Studio..."

    # Синхронизация android директории
    rsync -az --delete \
        --exclude=".gradle" \
        --exclude="build" \
        --exclude=".idea" \
        --exclude="local.properties" \
        "$source_dir/" "$target_dir/"

    # Синхронизация общих файлов
    if [ -d "$ANDROID_STUDIO_PROJECT" ]; then
        # Копирование capacitor конфигурации
        [ -f "capacitor.config.json" ] && cp "capacitor.config.json" "$ANDROID_STUDIO_PROJECT/"
        [ -f "capacitor.config.ts" ] && cp "capacitor.config.ts" "$ANDROID_STUDIO_PROJECT/"

        # Синхронизация ресурсов
        if [ -d "public" ]; then
            mkdir -p "$ANDROID_STUDIO_PROJECT/public"
            rsync -az "public/" "$ANDROID_STUDIO_PROJECT/public/"
        fi
    fi

    success "Web → Android Studio завершено"
}

#######################################################
# Синхронизация Android Studio -> Web
#######################################################
sync_from_android_studio() {
    local source_dir="$ANDROID_STUDIO_PROJECT/android"
    local target_dir="./android"

    if [ ! -d "$source_dir" ]; then
        warn "Исходная директория не существует: $source_dir"
        return 1
    fi

    info "Синхронизация Android Studio → Web..."

    # Синхронизация android директории
    rsync -az \
        --exclude=".gradle" \
        --exclude="build" \
        --exclude=".idea" \
        --exclude="local.properties" \
        "$source_dir/" "$target_dir/"

    # Синхронизация конфигурации обратно
    if [ -f "$ANDROID_STUDIO_PROJECT/capacitor.config.json" ]; then
        cp "$ANDROID_STUDIO_PROJECT/capacitor.config.json" .
    fi

    success "Android Studio → Web завершено"
}

#######################################################
# Запуск Capacitor Sync
#######################################################
run_capacitor_sync() {
    if [ "$AUTO_CAPACITOR_SYNC" != "true" ]; then
        return 0
    fi

    info "Запуск Capacitor Sync..."

    # В основном проекте
    if command -v npx >/dev/null 2>&1; then
        npx cap sync android --no-build 2>/dev/null || warn "Capacitor sync failed (это нормально если нет dist)"
    fi

    # В Android Studio проекте
    if [ -d "$ANDROID_STUDIO_PROJECT" ]; then
        (cd "$ANDROID_STUDIO_PROJECT" && npx cap sync android --no-build 2>/dev/null) || true
    fi

    success "Capacitor Sync завершен"
}

#######################################################
# Двунаправленная синхронизация
#######################################################
bidirectional_sync() {
    # Проверка блокировки (предотвращение параллельных запусков)
    if [ -f "$LOCK_FILE" ]; then
        local lock_pid=$(cat "$LOCK_FILE")
        if ps -p "$lock_pid" >/dev/null 2>&1; then
            return 0
        fi
    fi

    echo $$ > "$LOCK_FILE"
    trap "rm -f $LOCK_FILE" EXIT

    log "Начало двунаправленной синхронизации..."

    # Хеши до синхронизации
    local web_hash_before=$(get_dir_hash "./android")
    local as_hash_before=""

    if [ -d "$ANDROID_STUDIO_PROJECT/android" ]; then
        as_hash_before=$(get_dir_hash "$ANDROID_STUDIO_PROJECT/android")
    fi

    # Синхронизация Web -> Android Studio
    sync_to_android_studio

    # Синхронизация Android Studio -> Web (если были изменения)
    if [ "$WATCH_ANDROID_CHANGES" = "true" ]; then
        if [ -d "$ANDROID_STUDIO_PROJECT/android" ]; then
            local as_hash_after=$(get_dir_hash "$ANDROID_STUDIO_PROJECT/android")

            if [ "$as_hash_before" != "$as_hash_after" ]; then
                info "Обнаружены изменения в Android Studio"
                sync_from_android_studio
            fi
        fi
    fi

    # Capacitor Sync
    run_capacitor_sync

    success "Синхронизация завершена успешно"
    rm -f "$LOCK_FILE"
}

#######################################################
# Мониторинг изменений
#######################################################
watch_mode() {
    log "╔══════════════════════════════════════════════╗"
    log "║  АВТОСИНХРОНИЗАЦИЯ С ANDROID STUDIO          ║"
    log "╚══════════════════════════════════════════════╝"
    echo ""
    info "Android Studio проект: $ANDROID_STUDIO_PROJECT"
    info "Интервал проверки: ${SYNC_INTERVAL}s"
    info "Нажмите Ctrl+C для остановки"
    echo ""

    # Начальная синхронизация
    bidirectional_sync

    # Хеши для отслеживания изменений
    local web_hash=$(get_dir_hash "./android")
    local as_hash=$(get_dir_hash "$ANDROID_STUDIO_PROJECT/android")

    # Цикл мониторинга
    while true; do
        sleep "$SYNC_INTERVAL"

        local web_hash_new=$(get_dir_hash "./android")
        local as_hash_new=$(get_dir_hash "$ANDROID_STUDIO_PROJECT/android")

        # Проверка изменений
        local web_changed=false
        local as_changed=false

        if [ "$web_hash" != "$web_hash_new" ]; then
            web_changed=true
            info "Обнаружены изменения в Web проекте"
        fi

        if [ "$as_hash" != "$as_hash_new" ]; then
            as_changed=true
            info "Обнаружены изменения в Android Studio"
        fi

        # Синхронизация при изменениях
        if [ "$web_changed" = true ] || [ "$as_changed" = true ]; then
            bidirectional_sync

            # Обновление хешей
            web_hash=$(get_dir_hash "./android")
            as_hash=$(get_dir_hash "$ANDROID_STUDIO_PROJECT/android")
        fi
    done
}

#######################################################
# Главная функция
#######################################################
main() {
    # Проверка зависимостей
    if ! command -v rsync >/dev/null 2>&1; then
        error "rsync не установлен. Установите: apt-get install rsync"
        exit 1
    fi

    # Загрузка/создание конфигурации
    setup_config

    # Проверка наличия Android Studio проекта
    if [ ! -d "$ANDROID_STUDIO_PROJECT" ]; then
        error "Android Studio проект не найден: $ANDROID_STUDIO_PROJECT"
        error "Отредактируйте $CONFIG_FILE и укажите правильный путь"
        exit 1
    fi

    # Выбор режима
    case "${1:-watch}" in
        watch)
            watch_mode
            ;;
        sync)
            bidirectional_sync
            ;;
        to-as)
            sync_to_android_studio
            run_capacitor_sync
            ;;
        from-as)
            sync_from_android_studio
            run_capacitor_sync
            ;;
        *)
            echo "Использование: $0 [watch|sync|to-as|from-as]"
            echo ""
            echo "  watch    - Автоматический мониторинг и синхронизация (по умолчанию)"
            echo "  sync     - Однократная двунаправленная синхронизация"
            echo "  to-as    - Синхронизация Web → Android Studio"
            echo "  from-as  - Синхронизация Android Studio → Web"
            exit 1
            ;;
    esac
}

# Обработка сигналов
trap 'echo ""; log "Остановка синхронизации..."; rm -f "$LOCK_FILE"; exit 0' INT TERM

# Запуск
main "$@"
