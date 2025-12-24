/**
 * Environment-based logging utility
 * Logs are only active in development mode to reduce production bundle size
 */

import * as Sentry from "@sentry/react";

const isDev = import.meta.env.DEV;

export const logger = {
	log: isDev ? console.log.bind(console) : () => {},
	warn: isDev ? console.warn.bind(console) : () => {},
	error: isDev ? console.error.bind(console) : () => {},
	info: isDev ? console.info.bind(console) : () => {},
	debug: isDev ? console.debug.bind(console) : () => {},
	table: isDev ? console.table?.bind(console) : () => {},
};

/**
 * Production error logging with Sentry integration
 * Always enabled for critical errors in both development and production
 */
export const logError = (message: string, error?: unknown) => {
	// Always log to console
	console.error(message, error);

	// Send to Sentry in production if DSN is configured
	if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
		if (error instanceof Error) {
			Sentry.captureException(error, {
				tags: { source: "logError" },
				extra: { message },
			});
		} else {
			Sentry.captureMessage(message, {
				level: "error",
				extra: { error },
			});
		}
	}
};
