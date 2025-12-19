#!/bin/bash

echo "🚀 AI Accountant - GitHub Deployment Script"
echo "==========================================="
echo ""

# Check if git remote already exists
if git remote | grep -q "origin"; then
    echo "✓ Git remote 'origin' already exists"
    git remote -v
else
    echo "Adding GitHub remote..."
    git remote add origin https://github.com/drublev77-ux/ai-accountant.git
    echo "✓ Git remote added"
fi

echo ""
echo "Pushing to GitHub..."
echo "Note: You may be prompted for your GitHub credentials"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Code pushed to GitHub"
    echo ""
    echo "Next steps:"
    echo "1. Enable GitHub Pages:"
    echo "   → Go to: https://github.com/drublev77-ux/ai-accountant/settings/pages"
    echo "   → Under 'Source', select 'GitHub Actions'"
    echo ""
    echo "2. Deploy to Vercel:"
    echo "   → Go to: https://vercel.com/new"
    echo "   → Import your repository"
    echo ""
    echo "3. Deploy to Netlify:"
    echo "   → Go to: https://app.netlify.com/start"
    echo "   → Import from Git"
    echo ""
    echo "📖 For detailed instructions, see DEPLOYMENT_INSTRUCTIONS.md"
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo ""
    echo "Possible solutions:"
    echo "1. Create the repository first: https://github.com/new"
    echo "   - Repository name: ai-accountant"
    echo "   - Make it Public"
    echo "   - Don't initialize with README"
    echo ""
    echo "2. Check your GitHub credentials"
    echo "3. Make sure you have push access to the repository"
fi
