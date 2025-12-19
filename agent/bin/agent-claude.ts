#!/usr/bin/env tsx
/**
 * TypeScript Claude Agent Executable Entry Point
 * Replaces the bash wrapper with native TypeScript/SDK implementation
 */

import { realpathSync } from 'fs';
import { runClaudeAgent } from '../src/index.js';

/**
 * Read stdin if available
 */
async function readStdin(): Promise<string | null> {
  // Check if stdin is available (not a TTY)
  if (process.stdin.isTTY) {
    return null;
  }

  return new Promise((resolve, reject) => {
    let data = '';
    let hasData = false;

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      hasData = true;
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data.trim() || null);
    });

    process.stdin.on('error', (error) => {
      reject(error);
    });

    // Give more time for stdin data to arrive
    setTimeout(() => {
      if (!hasData) {
        resolve(null);
      }
      // If we have data, let the 'end' event handle it
    }, 1000);
  });
}

/**
 * Main entry point
 * Processes command line arguments and stdin, then delegates to the main agent function
 */
async function main(): Promise<void> {
  try {
    // Get command line arguments (excluding node and script name)
    const args = process.argv.slice(2);

    // Try to read from stdin
    const stdinInput = await readStdin();

    // If we have stdin input, use it as the prompt and pass args as flags only
    // Otherwise, use args as the prompt (existing behavior)
    const finalArgs = stdinInput ? [...args, stdinInput] : args;

    // Run the agent with processed arguments
    await runClaudeAgent(finalArgs);
  } catch (error) {
    console.error(`Fatal error:`, error);
    process.exit(1);
  }
}

// Execute main function only if this script is run directly
// Resolve symlinks in process.argv[1] to get the actual file path
const resolvedArgv1 = realpathSync(process.argv[1]);
if (import.meta.url === `file://${resolvedArgv1}`) {
  main().catch((error) => {
    console.error(`Unhandled error:`, error);
    process.exit(1);
  });
}