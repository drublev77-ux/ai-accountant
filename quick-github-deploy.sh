#!/bin/bash

# 🚀 Quick GitHub Deploy Script
# Автоматическая отправка кода на GitHub

set -e

echo "🚀 Quick GitHub Deploy Script"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not initialized!"
    echo "Run: git init && git branch -m main"
    exit 1
fi

# Get GitHub username and repo name
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter repository name (default: vite-template): " REPO_NAME
REPO_NAME=${REPO_NAME:-vite-template}

echo ""
echo "📝 Configuration:"
echo "   GitHub Username: $GITHUB_USERNAME"
echo "   Repository Name: $REPO_NAME"
echo ""

# Update package.json if repo name is not vite-template
if [ "$REPO_NAME" != "vite-template" ]; then
    echo "🔧 Updating package.json with custom repo name..."
    sed -i "s|/vite-template/|/$REPO_NAME/|g" package.json
    echo "✅ Updated package.json"
fi

# Add all files
echo "📦 Adding all files to git..."
git add .

# Create commit
echo "💾 Creating commit..."
git commit -m "Initial commit: AI Accountant with GitHub Actions deploy" || {
    echo "⚠️  No changes to commit or commit failed"
}

# Check if remote exists
if git remote get-url origin &> /dev/null; then
    echo "⚠️  Remote 'origin' already exists. Removing..."
    git remote remove origin
fi

# Add remote
echo "🔗 Adding GitHub remote..."
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
echo ""
echo "You may need to authenticate with GitHub."
echo "Use your GitHub personal access token as password."
echo ""

git push -u origin main || {
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Possible reasons:"
    echo "1. Repository doesn't exist on GitHub"
    echo "   → Create it at: https://github.com/new"
    echo ""
    echo "2. Authentication failed"
    echo "   → Use Personal Access Token (not password)"
    echo "   → Generate at: https://github.com/settings/tokens"
    echo ""
    echo "3. Repository already has content"
    echo "   → Use: git push -u origin main --force"
    echo ""
    exit 1
}

echo ""
echo "✅ SUCCESS! Code pushed to GitHub!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Go to your repository:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "2. Enable GitHub Pages:"
echo "   → Settings → Pages"
echo "   → Source: GitHub Actions"
echo "   → Save"
echo ""
echo "3. Wait for deployment (2-3 minutes)"
echo "   → Check 'Actions' tab"
echo ""
echo "4. Your site will be live at:"
echo "   https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo ""
echo "🎉 Happy deploying!"
