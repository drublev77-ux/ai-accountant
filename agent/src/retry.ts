/**
 * Retry logic with exponential backoff for Claude Agent
 * Matches the bash script's retry behavior and error classification
 */

import type {
	QueryResult,
	RetryConfig,
	SDKMessage,
	SDKResultMessage,
} from "./types.js";
import { NON_RETRYABLE_PATTERNS, NonRetryableError } from "./types.js";

/**
 * Sleep for specified number of seconds
 */
async function sleep(seconds: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Log retry attempt (matching bash script behavior)
 */
function logRetry(message: string, config: RetryConfig): void {
	if (config.retryLog) {
		const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
		console.error(`${timestamp} [RETRY] ${message}`);
	}
}

/**
 * Check if an error is non-retryable based on result message
 * Matches bash script's error classification logic
 */
function isNonRetryableError(message: SDKResultMessage): boolean {
	if (message.subtype === "success" && !message.is_error) {
		return false;
	}

	// Check for specific error patterns that shouldn't be retried
	const resultText = "result" in message ? message.result : "";

	return NON_RETRYABLE_PATTERNS.some((pattern) => pattern.test(resultText));
}

/**
 * Calculate next delay with exponential backoff
 * Matches bash script logic: delay doubles each retry, capped at maxDelay
 */
function calculateNextDelay(currentDelay: number, maxDelay: number): number {
	const nextDelay = currentDelay * 2;
	return Math.min(nextDelay, maxDelay);
}

/**
 * Execute a query function with retry logic and exponential backoff
 * This is the core retry mechanism matching the bash script's behavior
 */
export async function executeWithRetry<T>(
	queryFn: (attempt: number) => Promise<T>,
	isSuccess: (result: T) => boolean,
	extractResultMessage: (result: T) => SDKResultMessage,
	config: RetryConfig,
): Promise<QueryResult> {
	let attempt = 1;
	let delay = config.baseDelay;

	while (attempt <= config.maxRetries) {
		logRetry(`Attempt ${attempt}/${config.maxRetries}`, config);

		try {
			const result = await queryFn(attempt);
			const resultMessage = extractResultMessage(result);

			if (isSuccess(result)) {
				logRetry(`Command succeeded on attempt ${attempt}`, config);
				return { success: true, message: resultMessage, attempt };
			}

			// Check for non-retryable errors
			if (isNonRetryableError(resultMessage)) {
				throw new NonRetryableError(
					`Non-retryable error encountered: ${
						"result" in resultMessage ? resultMessage.result : "Unknown error"
					}`,
					resultMessage,
				);
			}

			// If this was the last attempt, return the failure
			if (attempt >= config.maxRetries) {
				logRetry("All retry attempts exhausted", config);
				return { success: false, message: resultMessage, attempt };
			}

			// Wait before next retry
			logRetry(`Command failed, retrying in ${delay}s...`, config);
			await sleep(delay);

			// Calculate next delay with exponential backoff
			delay = calculateNextDelay(delay, config.maxDelay);
		} catch (error) {
			// If it's a NonRetryableError, re-throw it immediately
			if (error instanceof NonRetryableError) {
				throw error;
			}

			// For other errors, if this was the last attempt, re-throw
			if (attempt >= config.maxRetries) {
				logRetry("All retry attempts exhausted", config);
				throw error;
			}

			// Otherwise, log and continue retrying
			logRetry(`Exception occurred, retrying in ${delay}s: ${error}`, config);
			await sleep(delay);
			delay = calculateNextDelay(delay, config.maxDelay);
		}

		attempt++;
	}

	// This part of the code should now be unreachable, but we can throw to satisfy TypeScript's control flow analysis.
	throw new Error("Retry loop exited unexpectedly.");
}

/**
 * Simple retry helper for async functions
 * Used for basic operations that don't need complex result processing
 */
export async function simpleRetry<T>(
	fn: () => Promise<T>,
	config: Pick<
		RetryConfig,
		"maxRetries" | "baseDelay" | "maxDelay" | "retryLog"
	>,
): Promise<T> {
	let attempt = 1;
	let delay = config.baseDelay;
	let lastError: Error | undefined;

	while (attempt <= config.maxRetries) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			if (attempt >= config.maxRetries) {
				break;
			}

			if (config.retryLog) {
				console.error(
					`Retry attempt ${attempt}/${config.maxRetries} failed: ${lastError.message}`,
				);
			}

			await sleep(delay);
			delay = calculateNextDelay(delay, config.maxDelay);
			attempt++;
		}
	}

	throw lastError || new Error("Unknown error occurred during retry");
}
