// Polyfill for Web Crypto API (required for ethers.js)
import "./lib/crypto-polyfill";

import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import reportWebVitals from "./sdk/core/internal/reportWebVitals.ts";
import "./styles.css";
import "./i18n/config";

// Initialize Creao platform SDK
import { APP_CONFIG } from "./sdk/core/global.ts";
export { APP_CONFIG }; // for backward compatibility

// Initialize Sentry for error tracking
if (import.meta.env.VITE_SENTRY_DSN) {
	Sentry.init({
		dsn: import.meta.env.VITE_SENTRY_DSN,
		integrations: [
			Sentry.browserTracingIntegration(),
			Sentry.replayIntegration({
				maskAllText: false,
				blockAllMedia: false,
			}),
		],
		// Performance Monitoring
		tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in production, 100% in development
		// Session Replay
		replaysSessionSampleRate: 0.1, // 10% of sessions
		replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
		// Environment
		environment: import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE,
		// Release tracking
		release: `${import.meta.env.npm_package_name}@${import.meta.env.npm_package_version}`,
		// Additional settings
		beforeSend(event) {
			// Filter out errors in development if needed
			if (!import.meta.env.PROD) {
				console.log("Sentry Event:", event);
			}
			return event;
		},
	});
	console.log("Sentry initialized successfully");
}

// Create a QueryClient instance
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

// Create a new router instance
const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
	basepath: import.meta.env.TENANT_ID ? `/${import.meta.env.TENANT_ID}` : "/",
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
