#!/usr/bin/env bash
# https://code.claude.com/docs/en/hooks#pretooluse-decision-control
#
# PreToolUse hook for Write/Edit tool - File access control
# Rules:
# 1. Block writing files under src/sdk directory (only SDK Generator can write)
# 2. Block writing files outside project directory
# 3. Allow writing all other files within project directory

# Read JSON input from stdin and extract target_file using jq
file_path=$(jq -r '.tool_input.file_path // ""')

# If no file path extracted, allow by default
if [ -z "$file_path" ]; then
    exit 0
fi

# Use case statement for pattern matching
case "$file_path" in
    ${CLAUDE_PROJECT_DIR}/src/sdk/*)
        echo 'src/sdk is protected. Only SDK Generator can write to this directory.' >&2
        exit 2
        ;;
    ${CLAUDE_PROJECT_DIR}/*)
        exit 0
        ;;
    *)
        echo "Access denied: file must be within project directory." >&2
        exit 2
        ;;
esac
