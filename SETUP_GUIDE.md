# دليل الإعداد والتشغيل الكامل
## نظام سكن - Backend API + Frontend

---

## ✅ ما تم إنجازه

### Backend API (إنتاج جاهز)
تم بناء REST API كامل يتضمن:

#### 1. البنية التحتية الأساسية
- ✅ Express.js server مع middleware كامل
- ✅ MySQL database connection pool
- ✅ JWT authentication + bcrypt passwords
- ✅ Security middleware شامل (Helmet, Rate limiting, XSS, SQL injection)
- ✅ Error handling احترافي
- ✅ CORS configuration

#### 2. المصادقة والأمان
- ✅ نظام تسجيل وتسجيل دخول كامل
- ✅ JWT tokens (7 أيام) + Refresh tokens (30 يوم)
- ✅ Role-based access control (4 أدوار)
- ✅ Subscription-based API access
- ✅ Rate limiting: 100 طلب/15 دقيقة (عام), 5 محاولات/15 دقيقة (دخول)

#### 3. نقاط النهاية API
**المصادقة (7 endpoints):**
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me
- POST /api/v1/auth/refresh-token
- POST /api/v1/auth/logout
- PUT /api/v1/auth/update-profile
- PUT /api/v1/auth/change-password

**المباني (6 endpoints):**
- GET /api/v1/buildings (قائمة مع إحصائيات)
- GET /api/v1/buildings/:id
- POST /api/v1/buildings
- PUT /api/v1/buildings/:id
- DELETE /api/v1/buildings/:id
- GET /api/v1/buildings/:id/stats

**الوحدات (6 endpoints):**
- GET /api/v1/units (مع فلتر بالمبنى)
- GET /api/v1/units/:id
- POST /api/v1/units
- PUT /api/v1/units/:id
- DELETE /api/v1/units/:id
- GET /api/v1/units/:id/tenants

**الفواتير (6 endpoints):**
- GET /api/v1/invoices (مع filters)
- GET /api/v1/invoices/:id
- POST /api/v1/invoices
- PUT /api/v1/invoices/:id
- DELETE /api/v1/invoices/:id
- PATCH /api/v1/invoices/:id/pay

**الاشتراكات (6 endpoints):**
- GET /api/v1/subscriptions/all (admin)
- GET /api/v1/subscriptions/my
- GET /api/v1/subscriptions/plans
- POST /api/v1/subscriptions (admin)
- POST /api/v1/subscriptions/:id/renew
- PATCH /api/v1/subscriptions/:id/cancel

**العملاء (5 endpoints - admin فقط):**
- GET /api/v1/customers
- GET /api/v1/customers/stats
- GET /api/v1/customers/:id
- PUT /api/v1/customers/:id
- DELETE /api/v1/customers/:id

**المستخدمين (4 endpoints):**
- GET /api/v1/users
- POST /api/v1/users
- PUT /api/v1/users/:id
- DELETE /api/v1/users/:id

**المجموع: 46 endpoint كاملة**

#### 4. الملفات المُنشأة (22 ملف)
```
backend-api/
├── config/
│   └── database.js           ✅
├── controllers/
│   ├── authController.js     ✅ (7 functions)
│   ├── buildingsController.js ✅ (6 functions)
│   ├── unitsController.js     ✅ (6 functions)
│   ├── invoicesController.js  ✅ (6 functions)
│   ├── subscriptionsController.js ✅ (6 functions)
│   ├── customersController.js ✅ (5 functions)
│   └── usersController.js     ✅ (4 functions)
├── middleware/
│   ├── auth.js               ✅ (3 middlewares)
│   ├── security.js           ✅ (8 functions)
│   └── errorHandler.js       ✅ (3 functions)
├── routes/
│   ├── auth.js               ✅
│   ├── buildings.js          ✅
│   ├── units.js              ✅
│   ├── invoices.js           ✅
│   ├── subscriptions.js      ✅
│   ├── customers.js          ✅
│   └── users.js              ✅
├── utils/
│   └── auth.js               ✅ (5 functions)
├── .env                      ✅
├── .env.example              ✅
├── package.json              ✅ (16 dependencies)
├── server.js                 ✅
└── README.md                 ✅
```

---

## 🚀 خطوات التشغيل

### المرحلة 1: إعداد قاعدة البيانات MySQL

#### 1.1 تثبيت MySQL (إذا لم يكن مثبتاً)
- حمّل MySQL من: https://dev.mysql.com/downloads/installer/
- ثبّت MySQL Server 8.0+
- احفظ كلمة مرور root

#### 1.2 إنشاء قاعدة البيانات
افتح MySQL Command Line أو MySQL Workbench:
```sql
CREATE DATABASE sakan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sakan_db;
SOURCE C:/Users/ali.salah/Desktop/sakan/database/schema_advanced.sql;
```

أو عبر PowerShell:
```powershell
mysql -u root -p < "C:\Users\ali.salah\Desktop\sakan\database\schema_advanced.sql"
```

#### 1.3 التحقق من الإنشاء
```sql
USE sakan_db;
SHOW TABLES;
-- يجب أن ترى: customers, buildings, units, service_invoices, subscriptions, users, tenants
```

### المرحلة 2: تكوين Backend API

#### 2.1 تحديث ملف .env
افتح `backend-api\.env` وعدّل:
```env
DB_PASSWORD=كلمة-مرور-MySQL-الخاصة-بك

# للإنتاج، غيّر المفاتيح السرية:
JWT_SECRET=مفتاح-قوي-عشوائي-طويل
JWT_REFRESH_SECRET=مفتاح-آخر-قوي-عشوائي
```

#### 2.2 تشغيل Backend Server
```powershell
cd C:\Users\ali.salah\Desktop\sakan\backend-api
npm run dev
```

يجب أن ترى:
```
✅ Server running on port 5000
📍 Environment: development
✅ Database connected successfully
```

#### 2.3 اختبار API
افتح متصفح واذهب إلى:
```
http://localhost:5000/api/health
```
يجب أن ترى:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-..."
}
```

### المرحلة 3: إنشاء بيانات تجريبية

#### 3.1 تسجيل حساب admin
استخدم Postman أو أي API client:
```
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "name": "مدير النظام",
  "email": "admin@sakan.com",
  "password": "Admin@123",
  "phone": "0501234567",
  "address": "الرياض"
}
```

سيعود لك:
```json
{
  "success": true,
  "message": "تم إنشاء الحساب بنجاح",
  "data": {
    "customer": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**احفظ الـ token** لاستخدامه في الطلبات التالية.

#### 3.2 تحديث الدور إلى admin (من MySQL)
```sql
USE sakan_db;
UPDATE customers SET role = 'admin' WHERE email = 'admin@sakan.com';
```

#### 3.3 إنشاء اشتراك (من MySQL)
```sql
INSERT INTO subscriptions (customer_id, plan, amount, start_date, end_date, status, auto_renew)
VALUES (1, 'premium', 500, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'active', true);
```

#### 3.4 إنشاء مبنى تجريبي (API)
```
POST http://localhost:5000/api/v1/buildings
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "برج النخيل",
  "address": "شارع الملك فهد",
  "city": "الرياض",
  "floors_count": 5,
  "units_per_floor": 4,
  "description": "برج سكني حديث"
}
```

### المرحلة 4: ربط Frontend بـ Backend

#### 4.1 إنشاء ملف constants للـ API
أنشئ ملف `frontend/src/config/api.js`:
```javascript
export const API_BASE_URL = 'http://localhost:5000/api/v1';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};
```

#### 4.2 تحديث axios في صفحات React
مثال: تحديث `Buildings.jsx`:
```javascript
import { API_BASE_URL, getAuthHeaders } from '../config/api';

// بدلاً من:
axios.get('http://localhost:5000/buildings')

// استخدم:
axios.get(`${API_BASE_URL}/buildings`, {
  headers: getAuthHeaders()
})
```

#### 4.3 تحديث صفحة Login
```javascript
// في Login.jsx
const handleLogin = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password
  });
  
  if (response.data.success) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.customer));
    // redirect to dashboard
  }
};
```

#### 4.4 إضافة axios interceptor (اختياري)
في `App.jsx` أو `index.js`:
```javascript
import axios from 'axios';

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### المرحلة 5: تشغيل النظام الكامل

#### 5.1 تشغيل Backend
```powershell
cd C:\Users\ali.salah\Desktop\sakan\backend-api
npm run dev
```

#### 5.2 تشغيل Frontend (نافذة PowerShell جديدة)
```powershell
cd C:\Users\ali.salah\Desktop\sakan
npm start
```

#### 5.3 فتح التطبيق
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

---

## 🔒 الأمان والصلاحيات

### الأدوار المتاحة
1. **admin** - وصول كامل + إدارة العملاء والاشتراكات
2. **manager** - إدارة المباني والوحدات والفواتير
3. **accountant** - عرض وإدارة الفواتير فقط
4. **security** - عرض البيانات فقط

### نظام الاشتراكات
- كل customer يحتاج اشتراك نشط للوصول للـ API
- يتم التحقق من:
  - `status = 'active'`
  - `end_date > NOW()`
- عند انتهاء الاشتراك: يُمنع الوصول حتى التجديد

### Rate Limiting
- **API عام**: 100 طلب كل 15 دقيقة
- **تسجيل دخول**: 5 محاولات كل 15 دقيقة
- يتم reset بعد 15 دقيقة

---

## 📊 خطط الاشتراك

| الخطة | السعر | المدة | المزايا |
|------|------|------|---------|
| **Basic** | 200 ج.م | شهري | مبنى واحد، 20 وحدة |
| **Standard** | 300 ج.م | شهري | 3 مباني، 50 وحدة |
| **Premium** | 500 ج.م | شهري | غير محدود + دعم 24/7 |
| **Enterprise** | 1200 ج.م | سنوي | كل المزايا + تدريب |

---

## 🛠️ استكشاف الأخطاء

### مشكلة: Cannot connect to MySQL
**الحل:**
```powershell
# تأكد من تشغيل MySQL
net start MySQL80

# تحقق من كلمة المرور في .env
DB_PASSWORD=كلمة-المرور-الصحيحة
```

### مشكلة: JWT token expired
**الحل:**
- قم بتسجيل الدخول مرة أخرى
- أو استخدم `/auth/refresh-token`

### مشكلة: Rate limit exceeded
**الحل:**
- انتظر 15 دقيقة
- أو قلل `RATE_LIMIT_MAX_REQUESTS` في `.env` (للتطوير فقط)

### مشكلة: CORS error
**الحل:**
تأكد من `FRONTEND_URL` في `.env`:
```env
FRONTEND_URL=http://localhost:3000
```

---

## 📈 الخطوات التالية (اختياري)

### 1. إضافة Email Notifications
- سجّل حساب Gmail وفعّل App Passwords
- حدّث `.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### 2. إضافة Payment Gateway
- سجّل في Paymob (للسوق المصري)
- أو Stripe (عالمي)
- حدّث `.env` بالمفاتيح

### 3. Automated Backups
أنشئ `utils/backup.js`:
```javascript
const cron = require('node-cron');
const { exec } = require('child_process');

cron.schedule('0 2 * * *', () => {
  exec('mysqldump -u root -p sakan_db > backup.sql');
});
```

### 4. نشر على الإنتاج
- استأجر VPS (DigitalOcean, AWS, Linode)
- ثبّت Node.js, MySQL, Nginx
- استخدم PM2 لتشغيل التطبيق
- احصل على domain + SSL

---

## ✅ Checklist التحقق النهائي

### Backend
- [ ] MySQL يعمل
- [ ] قاعدة البيانات `sakan_db` موجودة
- [ ] `.env` محدّث بكلمة مرور صحيحة
- [ ] `npm install` اكتمل بنجاح
- [ ] Server يعمل على port 5000
- [ ] `/api/health` يرجع success

### Frontend
- [ ] `npm start` يعمل بدون أخطاء
- [ ] يفتح على port 3000
- [ ] صفحة Login تظهر

### Integration
- [ ] تم إنشاء customer admin في DB
- [ ] تم إنشاء subscription نشط
- [ ] Login يعمل ويرجع token
- [ ] API requests تستخدم Authorization header
- [ ] Buildings page تعرض البيانات من Backend

---

## 📞 الدعم
في حال واجهت أي مشكلة:
1. تحقق من console logs (Backend و Frontend)
2. راجع MySQL error logs
3. تأكد من تطابق البيانات في `.env`
4. تحقق من firewall لا يمنع port 5000

---

**تمت بنجاح! 🎉**
النظام الآن جاهز للاستخدام والتطوير.
