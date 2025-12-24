#!/bin/bash

# 🚀 Simple Auto Deploy
# Просто введите ваш GitHub username

set -e

GITHUB_TOKEN="${GITHUB_TOKEN:-}"  # Set via environment variable

echo "🚀 GitHub Auto Deploy"
echo "===================="
echo ""

# Запрос username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Username cannot be empty!"
    exit 1
fi

REPO_NAME="vite-template"

echo ""
echo "📝 Configuration:"
echo "   Username: $GITHUB_USERNAME"
echo "   Repo: $REPO_NAME"
echo ""

# Настройка git
echo "🔧 Setting up git..."
git config --global user.email "deploy@ai-accountant.app"
git config --global user.name "$GITHUB_USERNAME"
git config --global init.defaultBranch main

# Инициализация
if [ ! -d .git ]; then
    git init
fi

# Проверка репозитория
echo "🔍 Checking repository on GitHub..."
REPO_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME")

if [ "$REPO_CHECK" == "404" ]; then
    echo "📦 Creating repository..."
    curl -s -X POST \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/user/repos \
      -d "{\"name\":\"$REPO_NAME\",\"description\":\"AI Accountant App\",\"private\":false}" > /dev/null
    echo "✅ Repository created!"
fi

# Коммит
echo "📦 Preparing files..."
git add .
git commit -m "Deploy: AI Accountant" 2>/dev/null || echo "✅ Files already committed"

# Remote
if git remote get-url origin &> /dev/null; then
    git remote remove origin
fi
git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Push
echo "⬆️  Uploading to GitHub..."
git push -u origin main --force 2>&1 | grep -v "$GITHUB_TOKEN" || true

# Cleanup
git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo "✅ DEPLOYED!"
echo ""
echo "🌐 Your site: https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo "🔗 Repo: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "📋 Enable GitHub Pages:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/pages"
echo "   → Source: GitHub Actions → Save"
echo ""
