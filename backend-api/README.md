# Backend API - سكن (Sakan)

## نظرة عامة
API REST للواجهة الخلفية لنظام إدارة العقارات "سكن" مبني بتقنية Node.js و Express.js.

## المتطلبات
- Node.js >= 18.0.0
- MySQL >= 8.0
- npm أو yarn

## التثبيت

### 1. تثبيت الحزم
```bash
npm install
```

### 2. إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات
mysql -u root -p < ../database/schema_advanced.sql

# أو يدوياً
mysql -u root -p
CREATE DATABASE sakan_db;
USE sakan_db;
SOURCE ../database/schema_advanced.sql;
```

### 3. تكوين البيئة
قم بنسخ `.env` وتعديل الإعدادات:
```bash
# تأكد من تغيير:
DB_PASSWORD=كلمة-مرور-قاعدة-البيانات
JWT_SECRET=مفتاح-سري-قوي-للإنتاج
JWT_REFRESH_SECRET=مفتاح-سري-آخر-للتحديث
```

### 4. تشغيل الخادم

**وضع التطوير:**
```bash
npm run dev
```

**وضع الإنتاج:**
```bash
npm start
```

## نقاط النهاية الرئيسية

### المصادقة
- `POST /api/v1/auth/register` - تسجيل عميل جديد
- `POST /api/v1/auth/login` - تسجيل الدخول
- `GET /api/v1/auth/me` - معلومات المستخدم الحالي
- `POST /api/v1/auth/refresh-token` - تحديث الرمز
- `POST /api/v1/auth/logout` - تسجيل الخروج

### المباني
- `GET /api/v1/buildings` - قائمة المباني
- `POST /api/v1/buildings` - إضافة مبنى
- `PUT /api/v1/buildings/:id` - تحديث مبنى
- `DELETE /api/v1/buildings/:id` - حذف مبنى
- `GET /api/v1/buildings/:id/stats` - إحصائيات المبنى

### الوحدات
- `GET /api/v1/units` - قائمة الوحدات
- `POST /api/v1/units` - إضافة وحدة
- `PUT /api/v1/units/:id` - تحديث وحدة
- `DELETE /api/v1/units/:id` - حذف وحدة

### الفواتير
- `GET /api/v1/invoices` - قائمة الفواتير
- `POST /api/v1/invoices` - إضافة فاتورة
- `PATCH /api/v1/invoices/:id/pay` - تحديد الفاتورة كمدفوعة

### الاشتراكات
- `GET /api/v1/subscriptions/my` - اشتراكاتي
- `GET /api/v1/subscriptions/plans` - خطط الاشتراك
- `POST /api/v1/subscriptions/:id/renew` - تجديد الاشتراك

## الحماية والأمان

### المصادقة
- JWT tokens (صلاحية 7 أيام)
- Refresh tokens (صلاحية 30 يوم)
- Bcrypt password hashing (10 salt rounds)

### الأمان
- ✅ Helmet (Security headers)
- ✅ Rate limiting (100 طلب / 15 دقيقة)
- ✅ Rate limiting للدخول (5 محاولات / 15 دقيقة)
- ✅ XSS Protection
- ✅ SQL Injection Prevention
- ✅ CORS (Frontend URL فقط)
- ✅ Input validation

### صلاحيات الوصول
جميع نقاط النهاية تتطلب:
1. JWT token صالح في Authorization header
2. اشتراك نشط (ماعدا /auth)
3. صلاحيات حسب الدور (admin, manager, accountant, security)

## الأدوار

- **admin**: وصول كامل للنظام + إدارة العملاء
- **manager**: إدارة المباني والوحدات
- **accountant**: عرض وإدارة الفواتير
- **security**: عرض فقط

## هيكل المشروع

```
backend-api/
├── config/
│   └── database.js          # إعداد MySQL
├── controllers/
│   ├── authController.js    # منطق المصادقة
│   ├── buildingsController.js
│   ├── unitsController.js
│   ├── invoicesController.js
│   ├── subscriptionsController.js
│   ├── customersController.js
│   └── usersController.js
├── middleware/
│   ├── auth.js              # مصادقة وتفويض
│   ├── security.js          # حماية شاملة
│   └── errorHandler.js      # معالجة الأخطاء
├── routes/
│   ├── auth.js
│   ├── buildings.js
│   ├── units.js
│   ├── invoices.js
│   ├── subscriptions.js
│   ├── customers.js
│   └── users.js
├── utils/
│   └── auth.js              # دوال مساعدة للمصادقة
├── .env                     # متغيرات البيئة
├── package.json
└── server.js                # نقطة البداية
```

## الاختبار

```bash
npm test
```

## ترحيل البيانات

```bash
# تشغيل migrations
npm run migrate

# إضافة بيانات تجريبية
npm run seed
```

## الإنتاج

### نشر على VPS

1. **تثبيت PM2**
```bash
npm install -g pm2
```

2. **تشغيل التطبيق**
```bash
pm2 start server.js --name sakan-api
pm2 save
pm2 startup
```

3. **إعداد Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **SSL بواسطة Let's Encrypt**
```bash
sudo certbot --nginx -d api.yourdomain.com
```

## المساهمة
للمساهمة في المشروع، يرجى فتح pull request.

## الترخيص
جميع الحقوق محفوظة © 2024
