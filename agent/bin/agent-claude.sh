#!/usr/bin/bash

#================================================================================
# DEPRECATION NOTICE
#================================================================================
# This bash script is deprecated and will be removed in a future version.
# Please use the TypeScript implementation instead: agent-claude.ts
# The TypeScript version provides better error handling, type safety, and maintainability.
#================================================================================

# Retry configuration
MAX_RETRIES=${CLAUDE_MAX_RETRIES:-5}
BASE_DELAY=${CLAUDE_BASE_DELAY:-1}
MAX_DELAY=${CLAUDE_MAX_DELAY:-32}
RETRY_LOG=${CLAUDE_RETRY_LOG:-false}
ERROR_CODE=1

# Default permission mode
PERMISSION_MODE="bypassPermissions"

# Function to parse command line arguments
parse_arguments() {
    local args=()
    local i=1
    
    while [[ $i -le $# ]]; do
        local arg="${!i}"
        
        if [[ "$arg" == "--permission-mode" ]]; then
            # Next argument should be the permission mode value
            ((i++))
            if [[ $i -le $# ]]; then
                PERMISSION_MODE="${!i}"
            fi
        elif [[ "$arg" == --permission-mode=* ]]; then
            PERMISSION_MODE="${arg#*=}"
        else
            args+=("$arg")
        fi
        
        ((i++))
    done
    
    # Return the filtered arguments
    printf '%s\n' "${args[@]}"
}

# Function to get permission flag based on mode
get_permission_flag() {
    case "$PERMISSION_MODE" in
        "default"|"acceptEdits"|"plan"|"bypassPermissions")
            echo "--permission-mode $PERMISSION_MODE"
            ;;
        *)
            # Default to standard behavior for unknown modes
            echo ""
            ;;
    esac
}

# Function to log retry attempts
log_retry() {
    if [[ "$RETRY_LOG" == "true" ]]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') [RETRY] $*" >&2
    fi
}

# Function to parse JSON result from claude output
parse_claude_result() {
    local output_file="$1"
    local last_line
    local is_error
    
    # Get the last line which should contain the result JSON
    last_line=$(tail -n 1 "$output_file")
    
    # Check if it's a valid JSON line with type "result"
    if echo "$last_line" | jq -e '.type == "result"' >/dev/null 2>&1; then
        is_error=$(echo "$last_line" | jq -r 'if has("is_error") then .is_error else true end')

        if [[ "$is_error" == "false" ]]; then
            return 0  # Success
        else
            # Check for specific error patterns that shouldn't be retried
            local result_text=$(echo "$last_line" | jq -r '.result // ""')
            if echo "$result_text" | grep -qE "(authentication|permission|invalid.*argument|syntax.*error)" -i; then
                return 100  # Non-retryable error
            fi
            return 1  # Retryable error
        fi
    else
        # If we can't parse the JSON, fall back to exit code logic
        return 2  # Indicates fallback needed
    fi
}

# Function to execute claude with retry logic
execute_claude() {
    local attempt=1
    local delay=$BASE_DELAY
    local temp_output
    
    # Parse arguments to extract permission mode and get filtered args
    local filtered_args=()
    while IFS= read -r line; do
        filtered_args+=("$line")
    done < <(parse_arguments "$@")
    
    # Get the appropriate permission flag
    local permission_flag
    permission_flag=$(get_permission_flag)
    
    # Create temporary file for capturing output
    temp_output=$(mktemp)
    trap "rm -f '$temp_output'" EXIT
    
    while [[ $attempt -le $MAX_RETRIES ]]; do
        log_retry "Attempt $attempt/$MAX_RETRIES"
        
        # Execute the claude command and capture output
        local continue_flag=""
        [[ $attempt -gt 1 ]] && continue_flag="--continue"
        
        # Build the claude command with optional permission flag
        local claude_cmd=(claude --print --output-format "stream-json")
        if [[ -n "$permission_flag" ]]; then
            # Split permission flag into components and add them
            read -ra flag_parts <<< "$permission_flag"
            claude_cmd+=("${flag_parts[@]}")
        fi
        claude_cmd+=(--verbose $continue_flag "${filtered_args[@]}")
        
        "${claude_cmd[@]}" | tee "$temp_output"
        
        # Parse the JSON result to determine success/failure
        parse_claude_result "$temp_output"
        
        if [[ $? -eq 0 ]]; then
            # Success based on JSON parsing
            log_retry "Command succeeded on attempt $attempt"
            exit 0
        fi
        
        # Calculate next delay with exponential backoff
        log_retry "Command failed, retrying in ${delay}s..."
        sleep $delay
        
        # Exponential backoff: double the delay, cap at MAX_DELAY
        delay=$((delay * 2))
        if [[ $delay -gt $MAX_DELAY ]]; then
            delay=$MAX_DELAY
        fi
        
        ((attempt++))
    done

    log_retry "All retry attempts exhausted, exiting with code $ERROR_CODE"
    exit $ERROR_CODE
}

# Execute the main function only if script is run directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    execute_claude "$@"
fi 
