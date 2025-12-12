#!/bin/bash

# Script to set up PWA (Progressive Web App) for AI Accountant
# Usage: ./scripts/setup-pwa.sh

set -e

echo "🔧 Setting up Progressive Web App (PWA)..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Create Service Worker
echo -e "\n${BLUE}Step 1: Creating Service Worker...${NC}"

cat > public/sw.js << 'EOF'
const CACHE_NAME = 'ai-accountant-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch from cache (network falling back to cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseClone = response.clone();

        // Cache the response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});
EOF

echo -e "${GREEN}✓ Service Worker created: public/sw.js${NC}"

# Step 2: Check manifest.json
echo -e "\n${BLUE}Step 2: Checking manifest.json...${NC}"
if [ -f "public/manifest.json" ]; then
    echo -e "${GREEN}✓ manifest.json exists${NC}"
else
    echo -e "${YELLOW}⚠️  manifest.json not found in public/${NC}"
fi

# Step 3: Update index.html (instructions)
echo -e "\n${BLUE}Step 3: Add Service Worker registration to index.html${NC}"
echo -e "${YELLOW}Add this code before </body> tag in index.html:${NC}"
echo ""
echo '<link rel="manifest" href="/manifest.json">'
echo '<meta name="theme-color" content="#10b981">'
echo '<script>'
echo "  if ('serviceWorker' in navigator) {"
echo "    window.addEventListener('load', () => {"
echo "      navigator.serviceWorker.register('/sw.js')"
echo "        .then(reg => console.log('SW registered:', reg))"
echo "        .catch(err => console.log('SW error:', err));"
echo "    });"
echo "  }"
echo '</script>'
echo ""

# Step 4: Instructions
echo -e "\n${GREEN}✅ PWA Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Add Service Worker registration code to index.html (see above)"
echo "2. Build and deploy:"
echo "   npm run build"
echo "   npx vercel --prod"
echo ""
echo "3. Test PWA installation:"
echo "   - Chrome: Look for 'Install' button in address bar"
echo "   - Safari iOS: Share → Add to Home Screen"
echo "   - Android: Menu → Add to Home Screen"
echo ""
echo "📝 PWA Requirements:"
echo "   ✓ Service Worker (created)"
echo "   ✓ manifest.json (exists)"
echo "   - HTTPS (required for production)"
echo "   - Icons in manifest.json"
echo ""
echo "🔗 Useful links:"
echo "   - PWA Guide: https://web.dev/progressive-web-apps/"
echo "   - Lighthouse: Test PWA score in Chrome DevTools"
echo ""
