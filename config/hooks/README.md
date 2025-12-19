# Claude Code Hooks

This directory contains custom hooks for Claude code assistant interactions. All hooks follow the standard Claude hook conventions.

## Hook Behavior Reference

All hooks communicate status through exit codes, stdout, and stderr according to Claude's hook system:

### Exit Codes
- **Exit code 0**: Success. stdout is shown to the user in transcript mode (CTRL-R), except for UserPromptSubmit, where stdout is added to the context.
- **Exit code 2**: Blocking error. stderr is fed back to Claude to process automatically. See per-hook-event behavior below.
- **Other exit codes**: Non-blocking error. stderr is shown to the user and execution continues.

### Documentation
For complete hook documentation, see: https://docs.anthropic.com/en/docs/claude-code/hooks#hook-output
