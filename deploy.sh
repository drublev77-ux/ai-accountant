#!/bin/bash

# 🚀 AI Accountant - Quick Deploy Script
# This script builds and deploys your application

set -e

echo "🚀 AI Accountant Deployment Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check dependencies
echo -e "${BLUE}📦 Checking dependencies...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js is installed${NC}"

# Step 2: Install packages
echo ""
echo -e "${BLUE}📥 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Run type check and linting
echo ""
echo -e "${BLUE}🔍 Running type checks and linting...${NC}"
npm run check:safe
echo -e "${GREEN}✅ All checks passed${NC}"

# Step 4: Build the project
echo ""
echo -e "${BLUE}🔨 Building production bundle...${NC}"
npm run build
echo -e "${GREEN}✅ Build completed successfully${NC}"

# Step 5: Show build size
echo ""
echo -e "${BLUE}📊 Build Output:${NC}"
ls -lh dist/

# Step 6: Ask for deployment method
echo ""
echo -e "${YELLOW}Choose deployment method:${NC}"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) Skip deployment (build only)"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"

        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}Installing Vercel CLI...${NC}"
            npm install -g vercel
        fi

        # Check if logged in
        if ! vercel whoami &> /dev/null; then
            echo -e "${YELLOW}Please login to Vercel:${NC}"
            vercel login
        fi

        # Deploy
        vercel --prod
        echo -e "${GREEN}✅ Deployed to Vercel!${NC}"
        ;;
    2)
        echo ""
        echo -e "${BLUE}🚀 Deploying to Netlify...${NC}"

        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            echo -e "${YELLOW}Installing Netlify CLI...${NC}"
            npm install -g netlify-cli
        fi

        # Check if logged in
        if ! netlify status &> /dev/null; then
            echo -e "${YELLOW}Please login to Netlify:${NC}"
            netlify login
        fi

        # Deploy
        netlify deploy --prod --dir=dist
        echo -e "${GREEN}✅ Deployed to Netlify!${NC}"
        ;;
    3)
        echo ""
        echo -e "${GREEN}✅ Build completed. Skipping deployment.${NC}"
        echo -e "${BLUE}Your production files are in the 'dist' folder.${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 All done!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "- Visit your deployment URL"
echo "- Test all functionality"
echo "- Share with users"
echo ""
echo "For detailed deployment info, see: DEPLOY_INSTRUCTIONS.md"
