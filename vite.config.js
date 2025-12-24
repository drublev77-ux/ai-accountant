// import { createRequire } from "node:module";
import { resolve } from "node:path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { creaoPlugins } from "./config/vite/creao-plugin.mjs";
import { preloadPlugin } from "./config/vite/preload-plugin.mjs";

// https://vitejs.dev/config/
export default defineConfig({
	base: process.env.TENANT_ID
		? `/${process.env.TENANT_ID}/`
		: process.env.GITHUB_PAGES
			? `/${process.env.REPO_NAME || "vite-template"}/`
			: "/",
	define: {
		"import.meta.env.TENANT_ID": JSON.stringify(process.env.TENANT_ID || ""),
	},
	plugins: [
		...creaoPlugins(),
		TanStackRouterVite({
			autoCodeSplitting: true, // Enabled for automatic route-based code splitting
		}),
		viteReact({
			jsxRuntime: "automatic",
		}),
		svgr(),
		tailwindcss(),
		// Bundle analyzer - generates stats.html after build
		visualizer({
			filename: "./dist/stats.html",
			open: false,
			gzipSize: true,
			brotliSize: true,
			template: "treemap", // 'sunburst', 'treemap', 'network'
		}),
		// Preload hints for critical chunks
		preloadPlugin(),
		// Sentry plugin for source map upload
		process.env.SENTRY_AUTH_TOKEN &&
			sentryVitePlugin({
				org: "den-49",
				project: "vite-template",
				authToken: process.env.SENTRY_AUTH_TOKEN,
				sourcemaps: {
					assets: "./dist/**",
					ignore: ["node_modules"],
					filesToDeleteAfterUpload: "./dist/**/*.map",
				},
				telemetry: false,
			}),
	].filter(Boolean),
	test: {
		globals: true,
		environment: "jsdom",
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	server: {
		host: "0.0.0.0",
		port: 3000,
		allowedHosts: true, // respond to *any* Host header
		watch: {
			usePolling: true,
			interval: 300, // ms; tune if CPU gets high
		},
	},
	build: {
		sourcemap: true, // Enable source maps for Sentry
		chunkSizeWarningLimit: 1500,
		rollupOptions: {
			output: {
				// Manual chunk splitting for better tree-shaking
				manualChunks: (id) => {
					// Vendor chunks
					if (id.includes("node_modules")) {
						// React core
						if (id.includes("react") || id.includes("react-dom")) {
							return "vendor-react";
						}
						// TanStack (Router + Query)
						if (id.includes("@tanstack")) {
							return "vendor-tanstack";
						}
						// Recharts (large charting library)
						if (id.includes("recharts")) {
							return "vendor-recharts";
						}
						// Radix UI components
						if (id.includes("@radix-ui")) {
							return "vendor-radix";
						}
						// Date/time libraries
						if (id.includes("date-fns")) {
							return "vendor-date";
						}
						// Other vendors
						return "vendor-misc";
					}
				},
			},
		},
		// Enable tree-shaking optimizations
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true, // Remove console.logs in production
				drop_debugger: true,
				pure_funcs: ["console.log", "console.info", "console.debug"],
			},
		},
	},
});
