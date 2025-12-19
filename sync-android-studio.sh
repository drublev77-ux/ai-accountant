#!/bin/bash

#######################################################
# Синхронизация с Android Studio через rsync/scp
#######################################################

set -e

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Конфигурационный файл
CONFIG_FILE=".sync-config.local"

# Функции логирования
log() { echo -e "${GREEN}[SYNC]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

#######################################################
# Создание конфигурационного файла
#######################################################
create_config() {
    cat > "$CONFIG_FILE" << 'EOF'
# Конфигурация синхронизации с Android Studio
# ВАЖНО: Этот файл не добавляется в Git (в .gitignore)

# Метод синхронизации: rsync, scp, git
SYNC_METHOD="rsync"

# Для rsync/scp: путь к локальному проекту Android Studio
# Пример: /Users/username/AndroidStudioProjects/MyApp
LOCAL_ANDROID_PATH=""

# Для rsync/scp через SSH
# Пример: username@192.168.1.100:/path/to/android/project
REMOTE_ANDROID_PATH=""

# Для Git: URL удаленного репозитория
# Пример: https://github.com/username/repo.git
GIT_REMOTE_URL=""

# Дополнительные опции rsync
RSYNC_OPTS="-avz --delete --exclude=node_modules --exclude=.git --exclude=dist --exclude=build"

# Автоматическая синхронизация Capacitor после rsync
AUTO_CAP_SYNC=true
EOF
    
    log "Создан конфигурационный файл: $CONFIG_FILE"
    info "Отредактируйте файл $CONFIG_FILE для настройки синхронизации"
}

#######################################################
# Загрузка конфигурации
#######################################################
load_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        warn "Конфигурационный файл не найден. Создание..."
        create_config
        return 1
    fi
    
    # shellcheck source=/dev/null
    source "$CONFIG_FILE"
    return 0
}

#######################################################
# Синхронизация через rsync
#######################################################
sync_rsync() {
    local target="$1"
    
    if [ -z "$target" ]; then
        error "Не указан путь для синхронизации"
        return 1
    fi
    
    log "Синхронизация через rsync..."
    info "Целевой путь: $target"
    
    # Проверка доступности rsync
    if ! command -v rsync >/dev/null 2>&1; then
        error "rsync не установлен"
        return 1
    fi
    
    # Выполнение синхронизации
    # shellcheck disable=SC2086
    rsync $RSYNC_OPTS ./ "$target/" || {
        error "Ошибка при синхронизации rsync"
        return 1
    }
    
    log "✅ rsync синхронизация завершена"
    
    # Автоматический запуск cap sync на удаленной машине
    if [ "$AUTO_CAP_SYNC" = "true" ]; then
        info "Запуск Capacitor sync на целевой машине..."
        
        # Если это SSH путь
        if [[ "$target" =~ ^[^@]+@[^:]+: ]]; then
            local ssh_host="${target%:*}"
            local remote_path="${target#*:}"
            
            ssh "$ssh_host" "cd '$remote_path' && npx cap sync" || warn "Не удалось выполнить cap sync удаленно"
        fi
    fi
}

#######################################################
# Синхронизация через Git
#######################################################
sync_git() {
    log "Синхронизация через Git..."
    
    if [ -z "$GIT_REMOTE_URL" ]; then
        error "GIT_REMOTE_URL не настроен в $CONFIG_FILE"
        return 1
    fi
    
    # Проверка наличия удаленного репозитория
    if ! git remote | grep -q origin; then
        log "Добавление удаленного репозитория..."
        git remote add origin "$GIT_REMOTE_URL"
    fi
    
    # Коммит всех изменений
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log "Коммит изменений..."
        git add -A
        git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    # Push
    log "Отправка изменений..."
    git push origin HEAD
    
    log "✅ Git синхронизация завершена"
}

#######################################################
# Основная функция
#######################################################
main() {
    info "╔══════════════════════════════════════════════╗"
    info "║  СИНХРОНИЗАЦИЯ С ANDROID STUDIO              ║"
    info "╚══════════════════════════════════════════════╝"
    echo ""
    
    # Загрузка конфигурации
    if ! load_config; then
        error "Пожалуйста, настройте $CONFIG_FILE и запустите скрипт снова"
        exit 1
    fi
    
    # Выбор метода синхронизации
    case "$SYNC_METHOD" in
        rsync)
            if [ -n "$LOCAL_ANDROID_PATH" ]; then
                sync_rsync "$LOCAL_ANDROID_PATH"
            elif [ -n "$REMOTE_ANDROID_PATH" ]; then
                sync_rsync "$REMOTE_ANDROID_PATH"
            else
                error "Не настроен LOCAL_ANDROID_PATH или REMOTE_ANDROID_PATH в $CONFIG_FILE"
                exit 1
            fi
            ;;
        git)
            sync_git
            ;;
        *)
            error "Неизвестный метод синхронизации: $SYNC_METHOD"
            error "Допустимые значения: rsync, git"
            exit 1
            ;;
    esac
    
    echo ""
    log "✅ Синхронизация завершена!"
}

# Запуск
main "$@"
