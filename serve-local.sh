#!/bin/bash

# 🚀 Local Production Server
# Запускает production build локально для тестирования

echo "🚀 Starting AI Accountant - Production Build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Проверка наличия dist/
if [ ! -d "dist" ]; then
    echo "❌ Build not found! Creating production build..."
    npm run build
    echo ""
fi

echo "✅ Production build ready!"
echo "📦 Bundle size: $(du -sh dist | cut -f1)"
echo ""
echo "🌐 Starting server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Local:    http://localhost:3000"
echo "📍 Network:  http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Запуск сервера через npx (без установки)
npx --yes serve dist -p 3000 -s
