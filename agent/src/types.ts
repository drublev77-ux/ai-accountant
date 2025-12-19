/**
 * Type definitions for the Claude Agent TypeScript implementation
 * Based on the original bash script behavior and Claude Agent SDK types
 */

import type {
	PermissionMode,
	SDKMessage,
	SDKResultMessage,
	SettingSource,
} from "@anthropic-ai/claude-agent-sdk";

/**
 * Agent configuration interface matching bash script environment variables and CLI args
 */
export interface AgentConfig {
	/** Maximum number of retry attempts (CLAUDE_MAX_RETRIES) */
	maxRetries: number;
	/** Base delay between retries in seconds (CLAUDE_BASE_DELAY) */
	baseDelay: number;
	/** Maximum delay cap in seconds (CLAUDE_MAX_DELAY) */
	maxDelay: number;
	/** Whether to log retry attempts (CLAUDE_RETRY_LOG) */
	retryLog: boolean;
	/** Permission mode for the session */
	permissionMode: PermissionMode;
	/** Model to use for the session (--model flag) */
	model?: string;
	/** Command line arguments (prompt text) */
	args: string[];
}

/**
 * Retry configuration interface
 */
export interface RetryConfig {
	maxRetries: number;
	baseDelay: number;
	maxDelay: number;
	retryLog: boolean;
}

/**
 * Query execution result
 */
export type QueryResult = {
	success: boolean;
	message: SDKResultMessage;
	attempt: number;
};

/**
 * Non-retryable error patterns from the bash script
 */
export const NON_RETRYABLE_PATTERNS = [
	/authentication/i,
	/permission/i,
	/invalid.*argument/i,
	/syntax.*error/i,
] as const;

/**
 * Error classification for retry logic
 */
export class NonRetryableError extends Error {
	constructor(
		message: string,
		public readonly resultMessage: SDKResultMessage,
	) {
		super(message);
		this.name = "NonRetryableError";
	}
}

/**
 * Default configuration values matching bash script defaults
 */
export const DEFAULT_CONFIG: Omit<AgentConfig, "args"> = {
	maxRetries: 5,
	baseDelay: 1,
	maxDelay: 32,
	retryLog: false,
	permissionMode: "bypassPermissions",
} as const;

/**
 * Exit codes matching bash script behavior
 */
export const EXIT_CODES = {
	SUCCESS: 0,
	ERROR: 1,
} as const;

/**
 * Re-export commonly used SDK types for convenience
 */
export type {
	PermissionMode,
	SDKMessage,
	SDKResultMessage,
	SDKAssistantMessage,
	SDKUserMessage,
	SDKSystemMessage,
	SettingSource,
} from "@anthropic-ai/claude-agent-sdk";
