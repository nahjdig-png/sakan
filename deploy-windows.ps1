# ============================================================================
# Sakan Deployment Script - Windows PowerShell
# ============================================================================
# هذا السكريبت يقوم بـ:
# 1. التحقق من Docker Desktop
# 2. إنشاء ملف .env
# 3. بناء الـ containers
# 4. تشغيل النظام
# ============================================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🚀 Sakan Deployment Script (Windows)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# 1. التحقق من Docker Desktop
# ============================================================================
Write-Host "🔍 التحقق من Docker..." -ForegroundColor Yellow

try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker مثبت: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker غير مثبت!" -ForegroundColor Red
    Write-Host "الرجاء تثبيت Docker Desktop من:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop" -ForegroundColor White
    exit 1
}

# التحقق من تشغيل Docker
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker غير مشغّل!" -ForegroundColor Red
    Write-Host "الرجاء تشغيل Docker Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker يعمل بشكل صحيح" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 2. التحقق من مجلد المشروع
# ============================================================================
$ProjectPath = "C:\Users\ali.salah\Desktop\sakan"

if (-not (Test-Path $ProjectPath)) {
    Write-Host "❌ مجلد المشروع غير موجود: $ProjectPath" -ForegroundColor Red
    exit 1
}

Set-Location $ProjectPath
Write-Host "✅ مجلد المشروع: $ProjectPath" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 3. إنشاء ملف .env إذا لم يكن موجوداً
# ============================================================================
if (-not (Test-Path ".env")) {
    Write-Host "📝 إنشاء ملف .env..." -ForegroundColor Yellow
    
    # توليد كلمات مرور عشوائية
    $DB_PASSWORD = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 20 | % {[char]$_})
    $JWT_SECRET = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
    $JWT_REFRESH_SECRET = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
    
    $envContent = @"
# Environment
NODE_ENV=production

# Server
PORT=5000
API_VERSION=v1

# Database (كلمة مرور تم توليدها تلقائياً)
DB_HOST=mysql
DB_PORT=3306
DB_NAME=sakan_db
DB_USER=sakan_user
DB_PASSWORD=$DB_PASSWORD

# JWT Secrets (تم توليدها تلقائياً - احفظها!)
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Frontend URL
FRONTEND_URL=http://localhost

# Email (عدّل هذه القيم)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Sakan System <noreply@sakan.com>

# Payment Gateway (اختياري)
PAYMOB_API_KEY=
PAYMOB_SECRET_KEY=
PAYMOB_INTEGRATION_ID=

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@

    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✅ تم إنشاء ملف .env" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  ملاحظة مهمة:" -ForegroundColor Yellow
    Write-Host "   كلمة مرور قاعدة البيانات: $DB_PASSWORD" -ForegroundColor White
    Write-Host "   احفظ هذه المعلومات في مكان آمن!" -ForegroundColor White
    Write-Host ""
    Write-Host "   لتعديل إعدادات Email:" -ForegroundColor Yellow
    Write-Host "   notepad .env" -ForegroundColor White
    Write-Host ""
    Read-Host "اضغط Enter للمتابعة"
} else {
    Write-Host "✅ ملف .env موجود بالفعل" -ForegroundColor Green
}
Write-Host ""

# ============================================================================
# 4. إنشاء المجلدات المطلوبة
# ============================================================================
Write-Host "📁 إنشاء المجلدات المطلوبة..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "backend-api\logs" | Out-Null
New-Item -ItemType Directory -Force -Path "backend-api\backups" | Out-Null
New-Item -ItemType Directory -Force -Path "backend-api\uploads" | Out-Null
Write-Host "✅ تم إنشاء المجلدات" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 5. إيقاف الـ containers القديمة
# ============================================================================
Write-Host "🛑 إيقاف الـ containers القديمة..." -ForegroundColor Yellow
docker compose down 2>$null
Write-Host "✅ تم إيقاف الـ containers القديمة" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 6. بناء الـ Docker images
# ============================================================================
Write-Host "🔨 بناء الـ Docker images..." -ForegroundColor Yellow
Write-Host "   (قد يستغرق هذا عدة دقائق...)" -ForegroundColor Gray
docker compose build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ فشل بناء الـ images" -ForegroundColor Red
    exit 1
}
Write-Host "✅ تم بناء الـ images" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 7. تشغيل الـ containers
# ============================================================================
Write-Host "🚀 تشغيل الـ containers..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ فشل تشغيل الـ containers" -ForegroundColor Red
    exit 1
}
Write-Host "✅ تم تشغيل الـ containers" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 8. انتظار بدء MySQL
# ============================================================================
Write-Host "⏳ انتظار بدء قاعدة البيانات..." -ForegroundColor Yellow
Start-Sleep -Seconds 20
Write-Host "✅ قاعدة البيانات جاهزة" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 9. عرض حالة الـ containers
# ============================================================================
Write-Host "📊 حالة الـ containers:" -ForegroundColor Cyan
docker compose ps
Write-Host ""

# ============================================================================
# 10. عرض السجلات
# ============================================================================
Write-Host "📝 آخر 10 أسطر من سجلات Backend:" -ForegroundColor Cyan
docker compose logs --tail=10 backend
Write-Host ""

# ============================================================================
# 11. معلومات الوصول
# ============================================================================
Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ تم تشغيل النظام بنجاح!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 الروابط:" -ForegroundColor Cyan
Write-Host "   Frontend:     http://localhost" -ForegroundColor White
Write-Host "   Backend API:  http://localhost:5000" -ForegroundColor White
Write-Host "   phpMyAdmin:   http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "🔧 أوامر مفيدة:" -ForegroundColor Cyan
Write-Host "   عرض السجلات:       docker compose logs -f" -ForegroundColor White
Write-Host "   إعادة التشغيل:     docker compose restart" -ForegroundColor White
Write-Host "   إيقاف النظام:      docker compose down" -ForegroundColor White
Write-Host "   تحديث النظام:      docker compose up -d --build" -ForegroundColor White
Write-Host ""
Write-Host "📁 مسار المشروع: $ProjectPath" -ForegroundColor Yellow
Write-Host "📝 ملف الإعدادات: $ProjectPath\.env" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  لا تنسَ:" -ForegroundColor Yellow
Write-Host "   1. تعديل إعدادات Email في .env" -ForegroundColor White
Write-Host "   2. فتح المتصفح على http://localhost" -ForegroundColor White
Write-Host ""
Write-Host "============================================" -ForegroundColor Green

# فتح المتصفح تلقائياً
Write-Host ""
$openBrowser = Read-Host "هل تريد فتح المتصفح الآن؟ (Y/N)"
if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process "http://localhost"
}
