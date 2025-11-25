#!/bin/bash
set -e

echo "================================================"
echo "   تنصيب منصة Sakan - نظام إدارة العقارات"
echo "================================================"
echo ""

# ألوان للرسائل
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# التأكد من وجود ملف .env
if [ ! -f ".env" ]; then
    echo -e "${RED}خطأ: ملف .env غير موجود!${NC}"
    echo "إنشاء ملف .env بقيم افتراضية..."
    cat > .env << 'EOF'
MYSQL_ROOT_PASSWORD=RootPass2024!
MYSQL_DATABASE=sakan_db
MYSQL_USER=sakan_user
MYSQL_PASSWORD=UserPass2024!

NODE_ENV=production
PORT=5000
JWT_SECRET=sakan_secret_key_2024_very_long_random_string_here_minimum_64_characters
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

CORS_ORIGIN=http://localhost:8080

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=noreply@sakan.com
EMAIL_FROM_NAME=Sakan Platform

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo -e "${GREEN}✓ تم إنشاء .env${NC}"
fi

# قراءة كلمات المرور من ملف .env
echo -e "${YELLOW}الخطوة 1: قراءة الإعدادات من .env${NC}"
source .env
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-RootPass2024!}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-UserPass2024!}

# معلومات Admin الافتراضية
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@nahj.digital}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-Nahj@2025!}
ADMIN_NAME=${ADMIN_NAME:-مسؤول النظام}

echo "البريد الإلكتروني للمدير: ${ADMIN_EMAIL}"
echo "اسم المدير: ${ADMIN_NAME}"
echo -e "${GREEN}✓ تم قراءة الإعدادات${NC}"
echo ""

# إيقاف الحاويات إن كانت تعمل
echo -e "${YELLOW}الخطوة 2: إيقاف الحاويات الحالية (إن وجدت)${NC}"
docker compose down 2>/dev/null || true
echo -e "${GREEN}✓ تم${NC}"
echo ""

# بناء وتشغيل الحاويات
echo -e "${YELLOW}الخطوة 3: بناء وتشغيل الحاويات${NC}"
docker compose build --no-cache
docker compose up -d
echo -e "${GREEN}✓ تم تشغيل الحاويات${NC}"
echo ""

# انتظار MySQL
echo -e "${YELLOW}الخطوة 4: انتظار جاهزية قاعدة البيانات${NC}"
echo -n "انتظار MySQL"
for i in {1..30}; do
    if docker exec mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo ""
        echo -e "${GREEN}✓ MySQL جاهزة${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# استيراد قاعدة البيانات الأساسية
echo -e "${YELLOW}الخطوة 5: استيراد الهيكل الأساسي للقاعدة${NC}"
docker exec -i mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" sakan_db < database/schema.sql 2>/dev/null || {
    echo -e "${YELLOW}تحذير: قد تكون الجداول موجودة مسبقاً، متابعة...${NC}"
}
echo -e "${GREEN}✓ تم استيراد الهيكل الأساسي${NC}"
echo ""

# استيراد القاعدة المتقدمة
echo -e "${YELLOW}الخطوة 6: استيراد الهيكل المتقدم${NC}"
docker exec -i mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" sakan_db < database/schema_advanced.sql 2>/dev/null || {
    echo -e "${YELLOW}تحذير: قد تكون الجداول موجودة مسبقاً، متابعة...${NC}"
}
echo -e "${GREEN}✓ تم استيراد الهيكل المتقدم${NC}"
echo ""

# استيراد حقول الإشعارات إن وجدت
if [ -f "database/add_notification_fields.sql" ]; then
    echo -e "${YELLOW}الخطوة 7: إضافة حقول الإشعارات${NC}"
    docker exec -i mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" sakan_db < database/add_notification_fields.sql 2>/dev/null || true
    echo -e "${GREEN}✓ تم${NC}"
    echo ""
fi

# التحقق من الجداول
echo -e "${YELLOW}الخطوة 8: التحقق من الجداول${NC}"
TABLES=$(docker exec -i mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "USE sakan_db; SHOW TABLES;" 2>/dev/null | wc -l)
echo "عدد الجداول المنشأة: $((TABLES - 1))"
echo -e "${GREEN}✓ تم التحقق${NC}"
echo ""

# انتظار Backend
echo -e "${YELLOW}الخطوة 9: انتظار جاهزية Backend API${NC}"
echo -n "انتظار Backend"
for i in {1..30}; do
    if curl -f http://localhost:5000/api/health --silent > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✓ Backend جاهز${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# إنشاء حساب Admin
echo -e "${YELLOW}الخطوة 10: إنشاء حساب المدير${NC}"

# تسجيل المستخدم عبر API
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"password\": \"${ADMIN_PASSWORD}\",
    \"name\": \"${ADMIN_NAME}\",
    \"phone\": \"0500000000\"
  }" 2>/dev/null || echo '{"success":false}')

if echo "$REGISTER_RESPONSE" | grep -q "success.*true\|token\|user"; then
    echo -e "${GREEN}✓ تم تسجيل المستخدم${NC}"
else
    echo -e "${YELLOW}تحذير: قد يكون المستخدم موجوداً مسبقاً${NC}"
fi
echo ""

# ترقية الدور إلى admin
echo -e "${YELLOW}الخطوة 11: ترقية الدور إلى Admin${NC}"
docker exec -i mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "UPDATE sakan_db.users SET role='admin' WHERE email='${ADMIN_EMAIL}';" 2>/dev/null
echo -e "${GREEN}✓ تم ترقية الدور${NC}"
echo ""

# إضافة اشتراك نشط
echo -e "${YELLOW}الخطوة 12: تفعيل اشتراك المدير${NC}"
docker exec -i mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" sakan_db <<EOF 2>/dev/null
INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, created_at, updated_at)
SELECT 
    u.id,
    (SELECT id FROM plans ORDER BY id LIMIT 1),
    'active',
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 365 DAY),
    NOW(),
    NOW()
FROM users u 
WHERE u.email = '${ADMIN_EMAIL}'
AND NOT EXISTS (
    SELECT 1 FROM subscriptions s WHERE s.user_id = u.id
)
LIMIT 1;
EOF
echo -e "${GREEN}✓ تم تفعيل الاشتراك${NC}"
echo ""

# عرض حالة الحاويات
echo -e "${YELLOW}الخطوة 13: التحقق من حالة النظام${NC}"
docker compose ps
echo ""

# عرض النتيجة النهائية
echo ""
echo "================================================"
echo -e "${GREEN}   ✓ تم التنصيب بنجاح!${NC}"
echo "================================================"
echo ""
echo "معلومات الدخول:"
echo "----------------"
echo "البريد الإلكتروني: ${ADMIN_EMAIL}"
echo "كلمة المرور: ${ADMIN_PASSWORD}"
echo "الدور: Admin"
echo ""
echo "روابط الوصول:"
echo "---------------"
echo "الواجهة الأمامية: http://$(hostname -I | awk '{print $1}'):8080"
echo "Backend API: http://$(hostname -I | awk '{print $1}'):5000/api/health"
echo "phpMyAdmin: http://$(hostname -I | awk '{print $1}'):8081"
echo ""
echo "أوامر مفيدة:"
echo "-------------"
echo "عرض السجلات: docker compose logs -f"
echo "إيقاف النظام: docker compose down"
echo "إعادة التشغيل: docker compose restart"
echo ""
echo -e "${YELLOW}ملاحظة: لا تنسَ ضبط Domain و SSL للإطلاق الفعلي${NC}"
echo ""
