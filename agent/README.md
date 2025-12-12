# Claude Agent TypeScript Implementation

A production-ready TypeScript implementation of the Claude Agent using the official Claude Agent SDK, replacing the bash wrapper with native TypeScript code.

## Features

✅ **Type Safety** - Full TypeScript implementation with comprehensive type definitions
✅ **Native SDK Integration** - Uses `@anthropic-ai/claude-agent-sdk` directly
✅ **Backward Compatibility** - Identical CLI interface and behavior to bash script
✅ **Exponential Backoff** - Robust retry logic with configurable parameters
✅ **Error Classification** - Smart detection of retryable vs non-retryable errors
✅ **Stream Processing** - Real-time message streaming in stream-json format

## Installation

```bash
cd agent
npm install
```

## Usage

The TypeScript agent maintains the exact same CLI interface as the bash script:

```bash
# Basic usage
./bin/agent-claude.ts "Your prompt here"

# With permission mode
./bin/agent-claude.ts "Your prompt here" --permission-mode bypassPermissions

# With environment variables
CLAUDE_MAX_RETRIES=3 CLAUDE_RETRY_LOG=true ./bin/agent-claude.ts "Your prompt"
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_MAX_RETRIES` | 5 | Maximum number of retry attempts |
| `CLAUDE_BASE_DELAY` | 1 | Base delay between retries in seconds |
| `CLAUDE_MAX_DELAY` | 32 | Maximum delay cap in seconds |
| `CLAUDE_RETRY_LOG` | false | Enable retry attempt logging |

## CLI Options

| Option | Description |
|--------|-------------|
| `--permission-mode <mode>` | Set permission mode (default, acceptEdits, plan, bypassPermissions). Defaults to bypassPermissions |
| `--permission-mode=<mode>` | Alternative syntax for permission mode |

## Architecture

### Core Modules

- **`src/types.ts`** - TypeScript type definitions and interfaces
- **`src/config.ts`** - Environment and CLI argument parsing
- **`src/retry.ts`** - Exponential backoff retry logic with error classification
- **`src/index.ts`** - Main SDK integration and query execution
- **`bin/agent-claude.ts`** - Executable entry point

### Error Handling

The agent classifies errors into retryable and non-retryable categories:

**Non-retryable errors** (will not retry):
- Authentication errors
- Permission errors
- Invalid argument errors
- Syntax errors

**Retryable errors** - All other errors will be retried with exponential backoff.

### Retry Logic

- **Initial delay**: Configurable base delay (default: 1 second)
- **Exponential backoff**: Delay doubles after each failed attempt
- **Maximum delay**: Capped at configurable maximum (default: 32 seconds)
- **Maximum attempts**: Configurable maximum retries (default: 5)

## Migration from Bash Script

The TypeScript implementation is a drop-in replacement:

```bash
# Before (bash script)
agent-claude "Your prompt here" --permission-mode default

# After (TypeScript)
agent-claude "Your prompt here" --permission-mode default
```

### Benefits over Bash Script

- **Type Safety**: Compile-time error checking
- **Better Error Handling**: Structured error classification and handling
- **Maintainability**: Modern TypeScript codebase with clear module structure
- **Performance**: Direct SDK integration without subprocess overhead
- **Extensibility**: Easy to add new features and configurations

## Docker Integration

The TypeScript agent integrates seamlessly with existing Docker templates:

```dockerfile
# Install TypeScript agent
COPY agent /home/user/agent
WORKDIR /home/user/agent
RUN npm ci --prefer-offline
RUN chmod +x /home/user/agent/bin/agent-claude.ts
RUN ln -s /home/user/agent/bin/agent-claude.ts /usr/local/bin/agent-claude
```

## Development

```bash
# Type checking
npm run type-check

# Build
npm run build

# Development mode
npm run dev "Your prompt here"
```

## Compatibility

- **Node.js**: 18.0.0 or higher
- **Environment**: Same as bash script (all environment variables supported)
- **CLI**: 100% compatible with existing bash script interface
- **Output**: Identical stream-json format to stdout
- **Exit codes**: 0 for success, 1 for failure (matching bash script)

## Examples

```bash
# Basic query with retry logging
CLAUDE_RETRY_LOG=true ./bin/agent-claude.ts "What is TypeScript?"

# Custom retry configuration
CLAUDE_MAX_RETRIES=3 CLAUDE_BASE_DELAY=2 ./bin/agent-claude.ts "Help me debug this code"

# With permission bypass
./bin/agent-claude.ts "Fix this bug" --permission-mode bypassPermissions

# Continue conversation on retry (automatic)
./bin/agent-claude.ts "Continue from where we left off"
```