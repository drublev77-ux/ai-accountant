#!/bin/bash

#######################################################
# Упрощенная синхронизация с Android Studio (без rsync)
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

#######################################################
# Поиск Android Studio проекта
#######################################################
find_android_studio_project() {
    local search_paths=(
        "$HOME/AndroidStudioProjects"
        "$HOME/StudioProjects"
        "$HOME/Projects"
        "$HOME/Documents/AndroidStudioProjects"
        "$HOME/Desktop"
    )

    # Имя проекта из capacitor.config
    local project_name="ai-accountant"
    if [ -f "capacitor.config.json" ]; then
        project_name=$(grep -o '"appId":\s*"[^"]*"' capacitor.config.json | cut -d'"' -f4 | rev | cut -d'.' -f1 | rev 2>/dev/null || echo "ai-accountant")
    fi

    # Поиск по стандартным путям (без вывода, только результат)
    for base_path in "${search_paths[@]}"; do
        if [ -d "$base_path" ]; then
            # Поиск по имени
            local found_path=$(find "$base_path" -maxdepth 2 -type d -name "$project_name" 2>/dev/null | head -1)

            if [ -n "$found_path" ] && [ -f "$found_path/android/build.gradle" ]; then
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

    # Автопоиск проекта (без цветного вывода для конфигурации)
    local as_project=$(find_android_studio_project 2>/dev/null)

    if [ -z "$as_project" ]; then
        # Пропускаем синхронизацию - проект не найден
        return 1
    fi

    # Сохранение конфигурации (простой текст, без ANSI-кодов)
    cat > "$CONFIG_FILE" << EOF
# Автоматически создано $(date)
ANDROID_STUDIO_PROJECT="$as_project"
SYNC_INTERVAL=5
AUTO_CAPACITOR_SYNC=true
WATCH_ANDROID_CHANGES=true
EOF

    source "$CONFIG_FILE"
}

#######################################################
# Синхронизация с помощью cp (без rsync)
#######################################################
sync_with_cp() {
    local source="$1"
    local target="$2"

    if [ ! -d "$source" ]; then
        warn "Исходная директория не существует: $source"
        return 1
    fi

    if [ ! -d "$target" ]; then
        info "Создание целевой директории: $target"
        mkdir -p "$target"
    fi

    # Копирование с исключением ненужных файлов
    info "Копирование $source -> $target"

    # Использование find для выборочного копирования
    find "$source" -type f \
        ! -path "*/.gradle/*" \
        ! -path "*/build/*" \
        ! -path "*/.idea/*" \
        ! -path "*/local.properties" \
        ! -path "*/.git/*" \
        ! -path "*/node_modules/*" \
        -print0 | while IFS= read -r -d '' file; do

        # Вычисляем относительный путь
        local rel_path="${file#$source/}"
        local target_file="$target/$rel_path"
        local target_dir=$(dirname "$target_file")

        # Создаём директорию если нужно
        mkdir -p "$target_dir"

        # Копируем файл
        cp -f "$file" "$target_file" 2>/dev/null || true
    done

    success "Копирование завершено"
}

#######################################################
# Синхронизация Web -> Android Studio
#######################################################
sync_to_android_studio() {
    if [ -z "$ANDROID_STUDIO_PROJECT" ]; then
        warn "Android Studio проект не настроен"
        return 1
    fi

    local source_dir="./android"
    local target_dir="$ANDROID_STUDIO_PROJECT/android"

    info "Синхронизация Web → Android Studio..."
    sync_with_cp "$source_dir" "$target_dir"

    # Синхронизация capacitor.config
    if [ -f "capacitor.config.json" ]; then
        cp -f capacitor.config.json "$ANDROID_STUDIO_PROJECT/" 2>/dev/null || true
    fi
    if [ -f "capacitor.config.ts" ]; then
        cp -f capacitor.config.ts "$ANDROID_STUDIO_PROJECT/" 2>/dev/null || true
    fi

    success "Web → Android Studio синхронизация завершена"
}

#######################################################
# Основная функция
#######################################################
main() {
    local mode="${1:-sync}"

    case "$mode" in
        sync)
            if ! setup_config; then
                warn "Синхронизация пропущена - проект не найден"
                exit 0
            fi
            sync_to_android_studio
            ;;
        watch)
            if ! setup_config; then
                warn "Синхронизация пропущена - проект не найден"
                exit 0
            fi
            info "Режим мониторинга не реализован в упрощенной версии"
            info "Используйте unified-sync.sh watch для автоматического мониторинга"
            ;;
        *)
            error "Неизвестный режим: $mode"
            info "Использование: $0 [sync|watch]"
            exit 1
            ;;
    esac
}

main "$@"
