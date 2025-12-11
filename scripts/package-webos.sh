#!/bin/bash

# Script to package AI Accountant for Palm Store (webOS)
# Usage: ./scripts/package-webos.sh

set -e

echo "📦 Packaging AI Accountant for webOS Palm Store..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Build the app
echo -e "\n${BLUE}Step 1: Building application...${NC}"
npm run build

# Step 2: Copy appinfo.json
echo -e "\n${BLUE}Step 2: Copying appinfo.json...${NC}"
cp appinfo.json dist/

# Step 3: Check for icons (optional - warn if missing)
echo -e "\n${BLUE}Step 3: Checking for icons...${NC}"
if [ -f "public/icon.png" ]; then
    cp public/icon.png dist/
    echo -e "${GREEN}✓ icon.png copied${NC}"
else
    echo "⚠️  Warning: public/icon.png not found (80x80 required)"
fi

if [ -f "public/largeIcon.png" ]; then
    cp public/largeIcon.png dist/
    echo -e "${GREEN}✓ largeIcon.png copied${NC}"
else
    echo "⚠️  Warning: public/largeIcon.png not found (130x130 required)"
fi

if [ -f "public/splashBackground.png" ]; then
    cp public/splashBackground.png dist/
    echo -e "${GREEN}✓ splashBackground.png copied${NC}"
else
    echo "⚠️  Warning: public/splashBackground.png not found (1920x1080 recommended)"
fi

# Step 4: Create ZIP package
echo -e "\n${BLUE}Step 4: Creating ZIP package...${NC}"
cd dist
zip -r ../ai-accountant-webos.zip . -q
cd ..

# Step 5: Show result
echo -e "\n${GREEN}✅ SUCCESS!${NC}"
echo -e "Package created: ${GREEN}ai-accountant-webos.zip${NC}"
echo ""
echo "Next steps:"
echo "1. Go to https://developer.lge.com/webOSTV"
echo "2. Sign in to your developer account"
echo "3. Create new app → Select 'Web App'"
echo "4. Upload ai-accountant-webos.zip"
echo "5. Fill in app details and submit for review"
echo ""
echo "📝 Don't forget to prepare:"
echo "   - Screenshots (1920x1080, minimum 2)"
echo "   - Privacy Policy URL"
echo "   - Support Email"
echo ""
