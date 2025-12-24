/**
 * Main Claude Agent TypeScript implementation
 * Uses the official Claude Agent SDK with retry logic matching bash script behavior
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import {
	createAgentConfig,
	validateConfig,
} from "./config.js";
import { executeWithRetry } from "./retry.js";
import type {
	AgentConfig,
	QueryResult,
	SDKMessage,
	SDKResultMessage,
	SettingSource,
} from "./types.js";
import { EXIT_CODES } from "./types.js";
import { execSync } from 'child_process';

/**
 * Detect the path to Claude Code executable
 * Uses 'which claude' to find it in PATH, falls back to SDK's bundled CLI
 */
function detectClaudeCodeExecutable(): string | undefined {
	try {
		const claudePath = execSync('which claude', { encoding: 'utf8' }).trim();
		return claudePath;
	} catch (error) {
		// Fall back to SDK's bundled CLI if claude not found in PATH
		console.warn('claude command not found in PATH, using bundled CLI');
		return undefined;
	}
}

/**
 * Stream messages to stdout in stream-json format
 * Matches the bash script's output behavior
 */
function streamMessage(message: SDKMessage): void {
	console.log(JSON.stringify(message));
}

/**
 * Execute Claude query with SDK integration
 * Handles streaming, continue option, and result processing
 */
async function executeClaudeQuery(
	config: AgentConfig,
	attempt: number,
): Promise<{
	messages: SDKMessage[];
	finalResult: SDKResultMessage | null;
}> {
	const messages: SDKMessage[] = [];
	let finalResult: SDKResultMessage | null = null;

	// Detect Claude Code executable path
	const pathToClaudeCodeExecutable = detectClaudeCodeExecutable();

	// Run startup_prompt_injection hook and capture its output to append to system prompt
	// This fixes the timing issue where SessionStart hooks run before the init message with agents list
	let systemPromptAppend: string | undefined;
	try {
		const hookScript = './config/hooks/startup_prompt_injection.sh';
		const hookOutput = execSync(hookScript, {
			encoding: 'utf8',
			cwd: process.cwd(),
			stdio: ['pipe', 'pipe', 'pipe']
		});
		if (hookOutput && hookOutput.trim()) {
			systemPromptAppend = `\n\n${hookOutput.trim()}`;
		}
	} catch (error) {
		// Hook doesn't exist or failed - that's okay, continue without it
	}

	// Prepare query options matching bash script behavior
	const options = {
		permissionMode: config.permissionMode,
		continue: attempt > 1, // Use continue on retries (matching bash script)
		abortController: new AbortController(),
		cwd: process.cwd(),
		env: process.env,
		systemPrompt: {
			type: "preset" as const,
			preset: "claude_code" as const,
			...(systemPromptAppend && { append: systemPromptAppend })
		},
		// Load .claude directory settings (agents, hooks, MCP servers)
		settingSources: ["user", "project", "local"] as SettingSource[],
		// Use global claude installation if available
		pathToClaudeCodeExecutable,
		// Pass model if specified
		...(config.model && { model: config.model }),
	};

	// Create the query with prompt and options
	const queryIterator = query({
		prompt: config.args.join(" "),
		options,
	});

	try {
		// Stream messages and collect them
		for await (const message of queryIterator) {
			messages.push(message);

			// Stream message to stdout (matching bash script behavior)
			streamMessage(message);

			// Check if this is the final result message
			if (message.type === "result") {
				finalResult = message;
				break;
			}
		}
	} catch (error) {
		// Handle query errors
		throw new Error(`Claude query failed`, { cause: error });
	}

	return { messages, finalResult };
}

/**
 * Check if query result indicates success
 */
function isQuerySuccess(result: {
	messages: SDKMessage[];
	finalResult: SDKResultMessage | null;
}): boolean {
	if (!result.finalResult) {
		return false;
	}

	const { finalResult } = result;
	return finalResult.subtype === "success" && !finalResult.is_error;
}

/**
 * Extract result message from query result
 */
function extractResultMessage(result: {
	messages: SDKMessage[];
	finalResult: SDKResultMessage | null;
}): SDKResultMessage {
	if (result.finalResult) {
		return result.finalResult;
	}

	// Create a generic failure message if no result found
	return {
		type: "result",
		subtype: "error_during_execution",
		uuid: crypto.randomUUID(),
		session_id: "unknown",
		duration_ms: 0,
		duration_api_ms: 0,
		is_error: true,
		num_turns: 0,
		total_cost_usd: 0,
		usage: {
			input_tokens: 0,
			output_tokens: 0,
			cache_creation_input_tokens: 0,
			cache_read_input_tokens: 0,
		},
		modelUsage: {},
		permission_denials: [],
	};
}

/**
 * Run Claude Agent with retry logic
 * Main execution function matching bash script behavior
 */
export async function runClaudeAgent(args: string[]): Promise<void> {
	try {
		// Parse configuration from environment and CLI args
		const config = createAgentConfig(args);

		// Validate configuration
		validateConfig(config);

		// If no arguments provided, show error
		if (config.args.length === 0) {
			console.error("Error: No prompt provided");
			process.exit(EXIT_CODES.ERROR);
		}

		// Execute with retry logic
		const result: QueryResult = await executeWithRetry(
			(attempt) => executeClaudeQuery(config, attempt),
			isQuerySuccess,
			extractResultMessage,
			{
				maxRetries: config.maxRetries,
				baseDelay: config.baseDelay,
				maxDelay: config.maxDelay,
				retryLog: config.retryLog,
			},
		);

		// Exit with appropriate code based on success/failure
		process.exit(result.success ? EXIT_CODES.SUCCESS : EXIT_CODES.ERROR);
	} catch (error) {
		// Handle configuration or execution errors
		console.error(`Agent execution failed: ${error}`);
		process.exit(EXIT_CODES.ERROR);
	}
}

/**
 * Default export for convenience
 */
export default runClaudeAgent;
