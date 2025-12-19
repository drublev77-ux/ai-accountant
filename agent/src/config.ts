/**
 * Configuration parser for Claude Agent TypeScript implementation
 * Handles environment variables and CLI arguments matching bash script behavior
 */

import type { AgentConfig, PermissionMode } from "./types.js";
import { DEFAULT_CONFIG } from "./types.js";

/**
 * Parse environment variables for agent configuration
 * Matches the bash script's environment variable handling
 */
function parseEnvironmentConfig(): Partial<AgentConfig> {
	const config: Partial<AgentConfig> = {};

	// Parse CLAUDE_MAX_RETRIES
	const maxRetriesEnv = process.env.CLAUDE_MAX_RETRIES;
	if (maxRetriesEnv) {
		const parsed = Number.parseInt(maxRetriesEnv, 10);
		if (!Number.isNaN(parsed) && parsed > 0) {
			config.maxRetries = parsed;
		}
	}

	// Parse CLAUDE_BASE_DELAY
	const baseDelayEnv = process.env.CLAUDE_BASE_DELAY;
	if (baseDelayEnv) {
		const parsed = Number.parseInt(baseDelayEnv, 10);
		if (!Number.isNaN(parsed) && parsed > 0) {
			config.baseDelay = parsed;
		}
	}

	// Parse CLAUDE_MAX_DELAY
	const maxDelayEnv = process.env.CLAUDE_MAX_DELAY;
	if (maxDelayEnv) {
		const parsed = Number.parseInt(maxDelayEnv, 10);
		if (!Number.isNaN(parsed) && parsed > 0) {
			config.maxDelay = parsed;
		}
	}

	// Parse CLAUDE_RETRY_LOG
	const retryLogEnv = process.env.CLAUDE_RETRY_LOG;
	if (retryLogEnv) {
		config.retryLog = retryLogEnv.toLowerCase() === "true";
	}

	return config;
}

/**
 * Parse command line arguments
 * Extracts permission mode, model, and filters arguments like the bash script
 */
function parseCliArguments(args: string[]): {
	permissionMode: PermissionMode;
	model?: string;
	filteredArgs: string[];
} {
	let permissionMode: PermissionMode = DEFAULT_CONFIG.permissionMode;
	let model: string | undefined;
	const filteredArgs: string[] = [];

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--permission-mode") {
			// Next argument should be the permission mode value
			i++;
			if (i < args.length) {
				const mode = args[i] as PermissionMode;
				if (isValidPermissionMode(mode)) {
					permissionMode = mode;
				}
			}
		} else if (arg.startsWith("--permission-mode=")) {
			// Extract permission mode from --permission-mode=value
			const mode = arg.split("=")[1] as PermissionMode;
			if (isValidPermissionMode(mode)) {
				permissionMode = mode;
			}
		} else if (arg === "--model") {
			// Next argument should be the model name
			i++;
			if (i < args.length) {
				model = args[i];
			}
		} else if (arg.startsWith("--model=")) {
			// Extract model from --model=value
			model = arg.split("=")[1];
		} else {
			// Regular argument - add to filtered args
			filteredArgs.push(arg);
		}
	}

	return { permissionMode, model, filteredArgs };
}

/**
 * Validate permission mode values
 */
function isValidPermissionMode(mode: string): mode is PermissionMode {
	const validModes: PermissionMode[] = [
		"default",
		"acceptEdits",
		"plan",
		"bypassPermissions",
	];
	return validModes.includes(mode as PermissionMode);
}

/**
 * Create agent configuration from environment variables and CLI arguments
 * Matches the bash script's configuration behavior exactly
 */
export function createAgentConfig(cliArgs: string[]): AgentConfig {
	// Parse environment configuration
	const envConfig = parseEnvironmentConfig();

	// Parse CLI arguments
	const { permissionMode, model, filteredArgs } = parseCliArguments(cliArgs);

	// Merge with defaults (environment overrides defaults, CLI overrides environment)
	const config: AgentConfig = {
		...DEFAULT_CONFIG,
		...envConfig,
		permissionMode,
		model,
		args: filteredArgs,
	};

	return config;
}

/**
 * Validate agent configuration
 */
export function validateConfig(config: AgentConfig): void {
	if (config.maxRetries <= 0) {
		throw new Error("maxRetries must be greater than 0");
	}
	if (config.baseDelay <= 0) {
		throw new Error("baseDelay must be greater than 0");
	}
	if (config.maxDelay <= 0) {
		throw new Error("maxDelay must be greater than 0");
	}
	if (config.maxDelay < config.baseDelay) {
		throw new Error("maxDelay must be greater than or equal to baseDelay");
	}
}
