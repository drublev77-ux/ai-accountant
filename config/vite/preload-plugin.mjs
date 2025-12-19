/**
 * Vite plugin to inject preload/prefetch hints for critical chunks
 */
export function preloadPlugin() {
	return {
		name: "preload-critical-chunks",
		transformIndexHtml(html, ctx) {
			// Only run in production build
			if (!ctx.bundle) return html;

			const criticalChunks = [];
			const prefetchChunks = [];

			// Identify critical and prefetch chunks
			for (const [fileName, chunk] of Object.entries(ctx.bundle)) {
				if (chunk.type === "chunk") {
					// Critical: vendor chunks (React, TanStack, etc.)
					if (
						fileName.includes("vendor-react") ||
						fileName.includes("vendor-tanstack") ||
						fileName.includes("index-")
					) {
						criticalChunks.push(fileName);
					}
					// Prefetch: large view components
					else if (
						fileName.includes("DashboardView") ||
						fileName.includes("TransactionsView")
					) {
						prefetchChunks.push(fileName);
					}
				}
			}

			// Generate preload tags for critical chunks
			const preloadTags = criticalChunks
				.map(
					(file) =>
						`    <link rel="modulepreload" href="/${file}" crossorigin />`,
				)
				.join("\n");

			// Generate prefetch tags for secondary chunks
			const prefetchTags = prefetchChunks
				.map((file) => `    <link rel="prefetch" href="/${file}" />`)
				.join("\n");

			// Inject into head
			const tags = [preloadTags, prefetchTags].filter(Boolean).join("\n");

			if (tags) {
				return html.replace("</head>", `${tags}\n  </head>`);
			}

			return html;
		},
	};
}
