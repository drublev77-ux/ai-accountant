#!/bin/bash

# 🚀 AI Accountant - GitHub Pages Auto Deploy
# This script will guide you through deploying to GitHub Pages

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 AI Accountant - GitHub Pages Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if git is configured
echo "📝 Checking git configuration..."
if ! git remote -v | grep -q "origin"; then
    echo "❌ No git remote found. Adding GitHub remote..."
    git remote add origin https://github.com/drublev77-ux/ai-accountant.git
    echo "✅ Remote added!"
else
    echo "✅ Git remote already configured"
    git remote -v
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Create GitHub repository:"
echo "   👉 Go to: https://github.com/new"
echo "   - Name: ai-accountant"
echo "   - Visibility: Public"
echo "   - Don't initialize with README"
echo ""
echo "2️⃣  Push to GitHub:"
echo "   Run: git push -u origin main"
echo ""
echo "   You'll need:"
echo "   - Username: drublev77-ux"
echo "   - Password: Your Personal Access Token"
echo ""
echo "   Create token at: https://github.com/settings/tokens/new"
echo "   Scopes needed: ✅ repo"
echo ""
echo "3️⃣  Enable GitHub Pages:"
echo "   👉 Go to: https://github.com/drublev77-ux/ai-accountant/settings/pages"
echo "   - Source: GitHub Actions"
echo ""
echo "4️⃣  Your site will be live at:"
echo "   🌐 https://drublev77-ux.github.io/ai-accountant/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask if user wants to push now
read -p "Ready to push to GitHub? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Pushing to GitHub..."
    echo ""

    git push -u origin main

    if [ $? -eq 0 ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ Success! Code pushed to GitHub"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Next steps:"
        echo "1. Go to: https://github.com/drublev77-ux/ai-accountant/settings/pages"
        echo "2. Set Source to: GitHub Actions"
        echo "3. Wait 2-3 minutes for deployment"
        echo "4. Visit: https://drublev77-ux.github.io/ai-accountant/"
        echo ""
        echo "Monitor deployment:"
        echo "👉 https://github.com/drublev77-ux/ai-accountant/actions"
        echo ""
    else
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "❌ Push failed"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Common fixes:"
        echo "1. Make sure you created the repository on GitHub"
        echo "2. Use Personal Access Token (not password)"
        echo "   Create at: https://github.com/settings/tokens/new"
        echo "3. Check repository exists: https://github.com/drublev77-ux/ai-accountant"
        echo ""
    fi
else
    echo ""
    echo "📖 When ready, push with:"
    echo "   git push -u origin main"
    echo ""
    echo "📄 Full instructions in: DEPLOY_TO_GITHUB_PAGES.md"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Full guide: DEPLOY_TO_GITHUB_PAGES.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
