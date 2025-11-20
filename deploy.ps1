# سكريبت النشر السريع على Ubuntu + Docker + Portainer (PowerShell)

Write-Host "🚀 بدء نشر نظام سكن..." -ForegroundColor Green

# 1. التحقق من ملف .env
if (-not (Test-Path .env)) {
    Write-Host "⚠️  ملف .env غير موجود. جاري النسخ من .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "📝 الرجاء تعديل ملف .env قبل المتابعة:" -ForegroundColor Cyan
    Write-Host "   notepad .env" -ForegroundColor White
    exit 1
}

# 2. إنشاء مجلدات الـ logs والـ backups
Write-Host "📁 إنشاء المجلدات المطلوبة..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path backend-api\logs | Out-Null
New-Item -ItemType Directory -Force -Path backend-api\backups | Out-Null

# 3. بناء الصور
Write-Host "🔨 بناء صور Docker..." -ForegroundColor Cyan
docker compose build

# 4. تشغيل الخدمات
Write-Host "🚀 تشغيل الخدمات..." -ForegroundColor Cyan
docker compose up -d

# 5. انتظار MySQL
Write-Host "⏳ انتظار بدء MySQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# 6. التحقق من الخدمات
Write-Host "🔍 التحقق من حالة الخدمات..." -ForegroundColor Cyan
docker compose ps

Write-Host ""
Write-Host "✅ النظام يعمل الآن!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 الروابط:" -ForegroundColor Cyan
Write-Host "   Frontend:     http://localhost" -ForegroundColor White
Write-Host "   Backend API:  http://localhost:5000" -ForegroundColor White
Write-Host "   phpMyAdmin:   http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "📊 لعرض السجلات:" -ForegroundColor Cyan
Write-Host "   docker compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "🛑 لإيقاف النظام:" -ForegroundColor Cyan
Write-Host "   docker compose down" -ForegroundColor White
