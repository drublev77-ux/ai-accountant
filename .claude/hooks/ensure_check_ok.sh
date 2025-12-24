#!/usr/bin/env bash
#
# Ensures code checks (typecheck & lint) pass. 
# This script does not perform any file modifications.
#
set -euo pipefail

# Run all checks
check_command="npx tsgo --noEmit"
if check_output=$(timeout 20 bash -c "$check_command" 2>&1); then
    # Check succeeded - exit successfully
    echo "✅ Check succeeded"
    exit 0
else
    # Format as structured prompt for LLM
    cat >&2 <<EOF
<check-failed>
<errors>
$check_output
</errors>
<action>Fix the errors above before proceeding.</action>
</check-failed>
EOF
    exit 2
fi
