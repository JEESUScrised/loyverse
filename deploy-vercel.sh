#!/bin/bash

# Быстрый деплой всех frontend приложений на Vercel

echo "🚀 Деплой на Vercel..."

echo ""
echo "📦 Деплой App (клиентское)..."
cd app
vercel --prod
cd ..

echo ""
echo "📦 Деплой Owner..."
cd owner
vercel --prod
cd ..

echo ""
echo "📦 Деплой Cashier..."
cd cashier
vercel --prod
cd ..

echo ""
echo "✅ Все приложения задеплоены!"
echo ""
echo "📝 Не забудьте:"
echo "   1. Обновить VITE_API_URL в настройках Vercel"
echo "   2. Задеплоить backend на Railway"
echo "   3. Запустить: npm run setup-mini-apps"
