#!/bin/bash

# 🚀 GitHub Upload Helper Script
# This script helps you upload your code to GitHub

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🚀 GitHub Upload Helper                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    echo "   Run: git init"
    exit 1
fi

# Check current status
echo "📊 Current Git Status:"
echo "---"
git log --oneline -1
git status --short
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote 'origin' already exists:"
    git remote -v
    echo ""
    read -p "Do you want to remove it and add a new one? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
        echo "✅ Removed existing remote"
    else
        echo "ℹ️  Keeping existing remote. You can push with: git push -u origin main"
        exit 0
    fi
fi

# Prompt for GitHub details
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Step 1: Create a new repository on GitHub                ║"
echo "║  https://github.com/new                                    ║"
echo "║                                                            ║"
echo "║  IMPORTANT: Don't add README, .gitignore, or license       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
read -p "Press ENTER when you've created the repository..."
echo ""

# Get repository details
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Step 2: Enter your repository details                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
read -p "Enter your GitHub username: " username
read -p "Enter repository name: " repo_name

# Validate input
if [ -z "$username" ] || [ -z "$repo_name" ]; then
    echo "❌ Error: Username and repository name cannot be empty"
    exit 1
fi

# Construct URL
REPO_URL="https://github.com/$username/$repo_name.git"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Step 3: Upload your code                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📡 Repository URL: $REPO_URL"
echo ""
read -p "Is this correct? (Y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "ℹ️  Aborted. Run the script again to retry."
    exit 0
fi

# Add remote
echo ""
echo "🔗 Adding remote..."
if git remote add origin "$REPO_URL"; then
    echo "✅ Remote added successfully"
else
    echo "❌ Failed to add remote"
    exit 1
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
echo "   (You may need to enter your GitHub credentials)"
echo ""

if git push -u origin main; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ✅ SUCCESS! Your code is now on GitHub!                   ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🎉 View your repository at:"
    echo "   https://github.com/$username/$repo_name"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Open АВТОДЕПЛОЙ.md for Netlify deployment setup"
    echo "   2. Configure GitHub Actions (already set up in .github/workflows/)"
    echo "   3. Invite collaborators if needed"
    echo ""
else
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ⚠️  Push failed                                           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Common solutions:"
    echo ""
    echo "1. Authentication with Personal Access Token:"
    echo "   - Create token: https://github.com/settings/tokens"
    echo "   - Use token as password when prompted"
    echo ""
    echo "2. Or use SSH instead:"
    echo "   git remote set-url origin git@github.com:$username/$repo_name.git"
    echo "   git push -u origin main"
    echo ""
    echo "📖 See GITHUB_UPLOAD.md for more details"
    exit 1
fi
