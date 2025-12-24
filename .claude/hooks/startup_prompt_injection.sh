#!/usr/bin/env bash
#
# This script implements prompt injection based on conditions:
# - If NEEDS_DATA_SCHEMA is true in .env.local, inject ORM_INJECTION_PROMPT
# - If .claude/extra_task_context.md exists, inject INTEGRATION_ENFORCEMENT_PROMPT
# - (Legacy) If spec/platform-sdk/api-schemas or mcp-schemas is not empty, inject legacy hook prompts
#
# Backward compatible: supports legacy api-hook-enforcer and mcp-hook-enforcer agents.
# This script only runs on startup session.
#
set -euo pipefail

CHECK_DATA_LAYER() {
  [ -f ".env.local" ] && grep -q "^NEEDS_DATA_SCHEMA=true" ".env.local"
}

CHECK_API_INTEGRATION() {
  [ -d "spec/platform-sdk/api-schemas" ] && ls -A spec/platform-sdk/api-schemas/ 2>/dev/null | grep -q .
}

CHECK_MCP_INTEGRATION() {
  [ -d "spec/platform-sdk/mcp-schemas" ] && ls -A spec/platform-sdk/mcp-schemas/ 2>/dev/null | grep -q .
}

# Check for new scaffold integration requests
# build-management creates .claude/extra_task_context.md before agent starts
CHECK_INTEGRATION() {
  [ -f ".claude/extra_task_context.md" ]
}

CRITICAL_TASK_PROMPT="You MUST include these required subagent assignments in your todo plan."

# ----------------------------------------- #
# ----- data layer generation prompts ----- #
# ----------------------------------------- #

if [ -f ".claude/agents/data-layer-generation.md" ]; then
# legacy version scaffold

ORM_INJECTION_PROMPT="## DATA LAYER

- **REQUIRED**: Use the 'data-layer-generation' subagent to analyze the data layer requirements and handle ORM operations.
- NEVER assume localStorage / mock / frontend-only solutions.
- Send the user's actual requirements as-is to the subagent.
- ALWAYS let RAF CLI determine the appropriate database-backed solution."

elif [ -f ".claude/agents/database-administrator.md" ]; then
# new version scaffold

ORM_INJECTION_PROMPT="## DATA LAYER

- **REQUIRED**: Use the 'database-administrator' subagent to analyze the data layer requirements and handle ORM operations.
- Send the user's actual requirements as-is to the subagent.
- DO NOT allow the 'database-administrator' subagent to generate any application code (e.g., React Hooks); it should use only the CLI to create and update schema and ORM files.
- ALWAYS let 'database-administrator' subagent determine the appropriate database-backed solution."

fi

# ----------------------------------------- #
# ---------- integration prompts ---------- #
# ----------------------------------------- #

if [ -f ".claude/agents/api-hook-enforcer.md" ] || [ -f ".claude/agents/mcp-hook-enforcer.md" ]; then
# legacy version scaffold

API_ENFORCEMENT_PROMPT="## API HOOKS

- **REQUIRED**: Use the 'api-hook-enforcer' subagent to generate production-ready React hooks for API tools."

MCP_ENFORCEMENT_PROMPT="## MCP HOOKS

- **REQUIRED**: Use the 'mcp-hook-enforcer' subagent to generate production-ready React hooks for MCP tools."

elif [ -f ".claude/agents/integration-administrator.md" ]; then
# new version scaffold

INTEGRATION_ENFORCEMENT_PROMPT="## INTEGRATIONS

- **REQUIRED**: Use the 'integration-administrator' subagent to install API/MCP integration methods.
- DO NOT allow the 'integration-administrator' subagent to generate any application code (e.g., React Hooks); it should use only the CLI to install SDK files.
- ALWAYS let 'integration-administrator' subagent determine the appropriate integrations to install."

fi

# ----------------------------------------- #
# ----- output context array -------------- #
# ----------------------------------------- #

# Initialize context array
context_parts=()

# Check if NEEDS_DATA_SCHEMA is true in .env.local
if CHECK_DATA_LAYER; then
  context_parts+=("$ORM_INJECTION_PROMPT")
fi

# Check for integration
if CHECK_API_INTEGRATION && [ -n "${API_ENFORCEMENT_PROMPT:-}" ]; then
  context_parts+=("$API_ENFORCEMENT_PROMPT")
fi

if CHECK_MCP_INTEGRATION && [ -n "${MCP_ENFORCEMENT_PROMPT:-}" ]; then
  context_parts+=("$MCP_ENFORCEMENT_PROMPT")
fi

if CHECK_INTEGRATION && [ -n "${INTEGRATION_ENFORCEMENT_PROMPT:-}" ]; then
    context_parts+=("$INTEGRATION_ENFORCEMENT_PROMPT")
fi

# Output context if any conditions were met
if [ ${#context_parts[@]} -gt 0 ]; then
  # Output summary first
  echo "=== REQUIRED SUBAGENT USAGE ==="
  echo
  echo "$CRITICAL_TASK_PROMPT"
  echo
  # Join array elements with newlines
  printf '%s\n\n' "${context_parts[@]}"
  echo "=== END OF REQUIRED SUBAGENT USAGE ==="
fi

# Output extra task context if it exists
EXTRA_CONTEXT_FILE=".claude/extra_task_context.md"
if [ -f "$EXTRA_CONTEXT_FILE" ] && [ -s "$EXTRA_CONTEXT_FILE" ]; then
  echo
  echo "=== ADDITIONAL TASK CONTEXT ==="
  cat "$EXTRA_CONTEXT_FILE"
  echo "=== END OF ADDITIONAL TASK CONTEXT ==="
fi

# Always exit successfully to allow the prompt to proceed
exit 0
