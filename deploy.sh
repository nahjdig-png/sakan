#!/bin/bash

# ============================================================================
# Sakan Deployment Script - Ubuntu Server
# ============================================================================
# هذا السكريبت يقوم بـ:
# 1. تثبيت Docker و Docker Compose
# 2. إنشاء ملف .env
# 3. بناء الـ containers
# 4. تشغيل النظام
# ============================================================================

set -e  # إيقاف عند أي خطأ

echo "============================================"
echo "🚀 Sakan Deployment Script"
echo "============================================"
echo ""

# ============================================================================
# 1. التحقق من صلاحيات root
# ============================================================================
if [ "$EUID" -ne 0 ]; then 
    echo "❌ الرجاء تشغيل السكريبت بصلاحيات root"
    echo "   استخدم: sudo bash deploy.sh"
    exit 1
fi

echo "✅ صلاحيات root متوفرة"
echo ""

# ============================================================================
# 2. تحديث النظام
# ============================================================================
echo "� تحديث النظام..."
apt update && apt upgrade -y
echo "✅ تم تحديث النظام"
echo ""

# ============================================================================
# 3. تثبيت المتطلبات الأساسية
# ============================================================================
echo "📦 تثبيت المتطلبات الأساسية..."
apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    nano
echo "✅ تم تثبيت المتطلبات"
echo ""

# ============================================================================
# 4. تثبيت Docker
# ============================================================================
if command -v docker &> /dev/null; then
    echo "✅ Docker مثبت بالفعل ($(docker --version))"
else
    echo "📦 تثبيت Docker..."
    
    # إضافة Docker GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # إضافة Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # تثبيت Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # بدء Docker service
    systemctl start docker
    systemctl enable docker
    
    echo "✅ تم تثبيت Docker بنجاح"
fi
echo ""

# ============================================================================
# 5. التحقق من مجلد المشروع
# ============================================================================
DEPLOY_DIR="/opt/sakan"

if [ ! -d "$DEPLOY_DIR" ]; then
    echo "📁 إنشاء مجلد المشروع: $DEPLOY_DIR"
    mkdir -p $DEPLOY_DIR
fi

cd $DEPLOY_DIR
echo "✅ مجلد المشروع: $DEPLOY_DIR"
echo ""

# ============================================================================
# 6. نسخ ملفات المشروع (إذا لم تكن موجودة)
# ============================================================================
if [ ! -f "docker-compose.yml" ]; then
    echo "⚠️  ملفات المشروع غير موجودة في $DEPLOY_DIR"
    echo "الرجاء نسخ المشروع أولاً باستخدام:"
    echo "  scp -r sakan user@server-ip:/opt/"
    echo "أو:"
    echo "  git clone your-repo-url /opt/sakan"
    exit 1
fi

echo "✅ ملفات المشروع موجودة"
echo ""

# ============================================================================
# 7. إنشاء ملف .env إذا لم يكن موجوداً
# ============================================================================
if [ ! -f ".env" ]; then
    echo "📝 إنشاء ملف .env..."
    
    # توليد كلمة مرور عشوائية قوية
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    cat > .env << EOF
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

# Frontend URL (عدّل هذا بعد ربط Domain)
FRONTEND_URL=http://$(hostname -I | awk '{print $1}')

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
EOF

    echo "✅ تم إنشاء ملف .env"
    echo ""
    echo "⚠️  ملاحظة مهمة:"
    echo "   كلمة مرور قاعدة البيانات: $DB_PASSWORD"
    echo "   احفظ هذه المعلومات في مكان آمن!"
    echo ""
    echo "   لتعديل إعدادات Email:"
    echo "   nano /opt/sakan/.env"
    echo ""
    read -p "اضغط Enter للمتابعة..."
else
    echo "✅ ملف .env موجود بالفعل"
fi
echo ""

# ============================================================================
# 8. إنشاء المجلدات المطلوبة
# ============================================================================
echo "📁 إنشاء المجلدات المطلوبة..."
mkdir -p backend-api/logs
mkdir -p backend-api/backups
mkdir -p backend-api/uploads
chmod 755 backend-api/logs
chmod 755 backend-api/backups
chmod 755 backend-api/uploads
echo "✅ تم إنشاء المجلدات"
echo ""

# ============================================================================
# 9. إيقاف الـ containers القديمة (إن وجدت)
# ============================================================================
echo "🛑 إيقاف الـ containers القديمة..."
docker compose down 2>/dev/null || true
echo "✅ تم إيقاف الـ containers القديمة"
echo ""

# ============================================================================
# 10. بناء الـ Docker images
# ============================================================================
echo "🔨 بناء الـ Docker images..."
docker compose build --no-cache
echo "✅ تم بناء الـ images"
echo ""

# ============================================================================
# 11. تشغيل الـ containers
# ============================================================================
echo "🚀 تشغيل الـ containers..."
docker compose up -d
echo "✅ تم تشغيل الـ containers"
echo ""

# ============================================================================
# 12. انتظار بدء MySQL
# ============================================================================
echo "⏳ انتظار بدء قاعدة البيانات..."
sleep 20
echo "✅ قاعدة البيانات جاهزة"
echo ""

# ============================================================================
# 13. عرض حالة الـ containers
# ============================================================================
echo "📊 حالة الـ containers:"
docker compose ps
echo ""

# ============================================================================
# 14. عرض السجلات
# ============================================================================
echo "📝 آخر 10 أسطر من سجلات Backend:"
docker compose logs --tail=10 backend
echo ""

# ============================================================================
# 15. معلومات الوصول
# ============================================================================
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "============================================"
echo "✅ تم تشغيل النظام بنجاح!"
echo "============================================"
echo ""
echo "🌐 الروابط:"
echo "   Frontend:     http://$SERVER_IP"
echo "   Backend API:  http://$SERVER_IP:5000"
echo "   phpMyAdmin:   http://$SERVER_IP:8080"
echo ""
echo "🔧 أوامر مفيدة:"
echo "   عرض السجلات:       docker compose logs -f"
echo "   إعادة التشغيل:     docker compose restart"
echo "   إيقاف النظام:      docker compose down"
echo "   تحديث النظام:      docker compose up -d --build"
echo ""
echo "📁 مسار المشروع: $DEPLOY_DIR"
echo "📝 ملف الإعدادات: $DEPLOY_DIR/.env"
echo ""
echo "⚠️  لا تنسَ:"
echo "   1. تعديل إعدادات Email في .env"
echo "   2. إعداد Firewall للبورتات: 80, 5000, 8080"
echo "   3. إعداد Domain وSSL (اختياري)"
echo ""
echo "============================================"


echo ""
echo "✅ النظام يعمل الآن!"
echo ""
echo "📍 الروابط:"
echo "   Frontend:     http://localhost"
echo "   Backend API:  http://localhost:5000"
echo "   phpMyAdmin:   http://localhost:8080"
echo ""
echo "📊 لعرض السجلات:"
echo "   docker compose logs -f"
echo ""
echo "🛑 لإيقاف النظام:"
echo "   docker compose down"
