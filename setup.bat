@echo off
REM ==============================================================================
REM Grandmaster 3D Chess - Windows Quick Setup & Install Script
REM سكريبت التثبيت والتشغيل السريع لمشروع شطرنج النخبة لنظام ويندوز
REM ==============================================================================

echo ==========================================================
echo 👑 مرحباً بك في مشروع شطرنج النخبة الملكي ثلاثي الأبعاد
echo    Grandmaster 3D Chess Setup (Windows)
echo ==========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ خطأ: Node.js غير مثبت على جهازك!
    echo يرجى تحميل وتثبيت Node.js من: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ تم العثور على Node.js!
echo.
echo 📦 جاري تثبيت الحزم والمكتبات (Installing dependencies)...
call npm install
if %errorlevel% neq 0 (
    echo ❌ فشل تثبيت المكتبات!
    pause
    exit /b 1
)

echo.
echo 🔍 فحص الكود البرمجي (Linting)...
call npm run lint

echo.
echo 🔨 اختبار بناء المشروع (Testing Build)...
call npm run build

echo.
echo ==========================================================
echo 🎉 تم تثبيت وبناء المشروع بنجاح!
echo لتشغيل اللعبة في المتصفح، نفذ الأمر التالي:
echo    npm run dev
echo ثم افتح: http://localhost:3000
echo ==========================================================
pause
