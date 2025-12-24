#!/usr/bin/env bash
#
# Startup script - combines session cleanup
#
set -euo pipefail

# Source shared file tracking utilities
source "$(dirname "$0")/file_tracker.sh"

# === SESSION CLEANUP ===
# Get project directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Define all local tracking files that should be cleaned up
LOCAL_FILES=(
    "$PROJECT_DIR/.claude/.local/.src_hooks_read.local"
    "$PROJECT_DIR/.claude/.local/.retry_counts.build.local"
)

# Remove each file if it exists
for file in "${LOCAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
    fi
done

# === Ensure .claude/.local directory exists ===
mkdir -p "$PROJECT_DIR/.claude/.local"

# === MARK HOOKS AS READ ===
HOOKS_DIR="src/hooks"
HOOKS_PATTERN="*.ts"

mark_files_as_read "$HOOKS_DIR" "$HOOKS_PATTERN"

# === Exit ===
exit 0
