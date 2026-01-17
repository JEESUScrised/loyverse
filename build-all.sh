#!/bin/bash

# Скрипт для сборки всех приложений

echo "📦 Собираем все приложения..."

echo "Сборка app..."
cd app
npm install
npm run build
cd ..

echo "Сборка owner..."
cd owner
npm install
npm run build
cd ..

echo "Сборка cashier..."
cd cashier
npm install
npm run build
cd ..

echo "✅ Все приложения собраны!"
