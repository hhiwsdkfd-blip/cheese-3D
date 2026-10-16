#!/usr/bin/env bash
# ==============================================================================
# Grandmaster 3D Chess - Push to GitHub Script
# سكريبت لرفع المشروع إلى مستودع GitHub بنقرة واحدة
# ==============================================================================

set -e

echo "=========================================================="
echo "🚀 سكريبت رفع مشروع شطرنج 3D إلى مستودعك على GitHub"
echo "=========================================================="
echo ""

REPO_URL="$1"

if [ -z "$REPO_URL" ]; then
    echo "يرجى إدخال رابط مستودع GitHub الخاص بك (HTTPS أو SSH):"
    echo "مثال: https://github.com/your-username/chess-3d.git"
    read -p "رابط المستودع: " REPO_URL
fi

if [ -z "$REPO_URL" ]; then
    echo "❌ لم يتم إدخال رابط المستودع. تم إلغاء العملية."
    exit 1
fi

echo ""
echo "1️⃣ التحقق من حالة Git وإضافة جميع الملفات والتعديلات..."
git add -A

echo "2️⃣ حفظ التعديلات بتسجيل commit..."
git commit -m "feat: Royal 3D Chess with Royal Marble Hall, Armored Pieces, AI Assistant, and Match Replay" || true

echo "3️⃣ تعيين الفرع الرئيسي إلى main..."
git branch -M main

echo "4️⃣ ربط المستودع البعيد origin بـ: $REPO_URL..."
if git remote get-url origin &> /dev/null; then
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi

echo "5️⃣ جاري رفع الملفات إلى GitHub..."
git push -u origin main

echo ""
echo "=========================================================="
echo "🎉 تم رفع المشروع بنجاح إلى مستودع GitHub!"
echo "يمكنك الآن زيارة المستودع على: $REPO_URL"
echo "كما سيبدأ ملف GitHub Actions (.github/workflows/deploy.yml) تلقائياً ببناء ونشر اللعبة!"
echo "=========================================================="
