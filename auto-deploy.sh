#!/bin/bash

# 🚀 Automatic GitHub Deploy Script
# Автоматический деплой на GitHub с использованием токена

set -e

GITHUB_TOKEN="${GITHUB_TOKEN:-}"  # Set via environment variable

echo "🚀 Automatic GitHub Deploy"
echo "=========================="
echo ""

# Запрос данных
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter repository name (default: vite-template): " REPO_NAME
REPO_NAME=${REPO_NAME:-vite-template}

echo ""
echo "📝 Configuration:"
echo "   GitHub Username: $GITHUB_USERNAME"
echo "   Repository Name: $REPO_NAME"
echo "   Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

# Проверка/создание репозитория на GitHub
echo "🔍 Checking if repository exists on GitHub..."

REPO_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME")

if [ "$REPO_CHECK" == "404" ]; then
    echo "📦 Repository doesn't exist. Creating..."

    CREATE_RESPONSE=$(curl -s -X POST \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/user/repos \
      -d "{\"name\":\"$REPO_NAME\",\"description\":\"AI Accountant - React app with GitHub Pages\",\"private\":false}")

    if echo "$CREATE_RESPONSE" | grep -q "\"id\""; then
        echo "✅ Repository created successfully!"
    else
        echo "❌ Failed to create repository!"
        echo "$CREATE_RESPONSE"
        exit 1
    fi
else
    echo "✅ Repository already exists"
fi

echo ""

# Настройка git конфигурации
echo "🔧 Configuring git..."
git config --global user.email "claude@ai-accountant.app"
git config --global user.name "$GITHUB_USERNAME"
git config --global init.defaultBranch main
echo "✅ Git configured"

# Инициализация git если нужно
if [ ! -d .git ]; then
    echo "🔧 Initializing git repository..."
    git init
    echo "✅ Git initialized"
fi

# Обновление package.json если нужно
if [ "$REPO_NAME" != "vite-template" ]; then
    echo "🔧 Updating package.json with custom repo name..."
    sed -i "s|/vite-template/|/$REPO_NAME/|g" package.json
    echo "✅ Updated package.json"
fi

# Добавление файлов
echo "📦 Adding all files to git..."
git add .

# Создание коммита
echo "💾 Creating commit..."
git commit -m "Initial commit: AI Accountant with GitHub Actions deploy" || {
    echo "⚠️  No changes to commit (files already committed)"
}

# Удаление старого remote если есть
if git remote get-url origin &> /dev/null; then
    echo "🔗 Removing old remote..."
    git remote remove origin
fi

# Добавление remote с токеном
echo "🔗 Adding GitHub remote with authentication..."
git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Push на GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main --force 2>&1 | grep -v "$GITHUB_TOKEN" || {
    echo ""
    echo "❌ Push failed!"
    exit 1
}

# Удаление токена из remote (безопасность)
echo "🔒 Removing token from git remote..."
git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo "✅ SUCCESS! Code pushed to GitHub!"
echo ""
echo "📋 Enabling GitHub Pages..."

# Включение GitHub Pages через API
PAGES_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/pages" \
  -d '{"source":{"branch":"gh-pages","path":"/"}}' 2>&1)

# GitHub Pages будет настроен через Actions, поэтому ошибка нормальна
echo "ℹ️  GitHub Pages will be configured automatically by GitHub Actions"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Check deployment status:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions"
echo ""
echo "2. Enable GitHub Pages (if not auto-enabled):"
echo "   → https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/pages"
echo "   → Source: GitHub Actions"
echo ""
echo "3. Wait for deployment (2-3 minutes)"
echo ""
echo "4. Your site will be live at:"
echo "   https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo ""
echo "🚀 Opening GitHub Actions page..."
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME/actions"
echo ""
