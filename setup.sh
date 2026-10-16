#!/usr/bin/env bash
# ==============================================================================
# Grandmaster 3D Chess - Quick Setup & Install Script
# سكريبت التثبيت والتشغيل السريع لمشروع شطرنج النخبة ثلاثي الأبعاد
# ==============================================================================

set -e

echo "=========================================================="
echo "👑 مرحباً بك في مشروع شطرنج النخبة الملكي ثلاثي الأبعاد"
echo "   Grandmaster 3D Chess Setup"
echo "=========================================================="
echo ""

# 1. Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ خطأ: Node.js غير مثبت على جهازك!"
    echo "يرجى تثبيت Node.js (الإصدار 18 أو أحدث) من https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ تم العثور على Node.js: $NODE_VERSION"

# 2. Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "❌ خطأ: npm غير مثبت!"
    exit 1
fi

echo "📦 جاري تثبيت المكتبات والاعتماديات (Installing dependencies)..."
npm install

echo ""
echo "🔍 جاري التحقق من التوافق البرمجي (Checking TypeScript)..."
npm run lint

echo ""
echo "🔨 جاري اختبار البناء (Testing Build)..."
npm run build

echo ""
echo "=========================================================="
echo "🎉 تم تثبيت وبناء المشروع بنجاح!"
echo "لتشغيل اللعبة في المتصفح، نفذ الأمر التالي:"
echo "   npm run dev"
echo "ثم افتح: http://localhost:3000"
echo "=========================================================="
