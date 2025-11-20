# خطوات تفعيل النظام الكامل 🚀

## ✅ تم الإنجاز حتى الآن:

### Backend API
- ✅ 22 ملف API جاهز (routes, controllers, middleware)
- ✅ JWT Authentication + bcrypt
- ✅ Security middleware (rate limiting, XSS, SQL injection)
- ✅ Email service (NodeMailer) مع 4 قوالب
- ✅ Cron jobs للإشعارات التلقائية
- ✅ Error handling شامل

### Frontend
- ✅ Axios interceptor للـ JWT tokens
- ✅ API client مع token refresh تلقائي
- ✅ 11 صفحة كاملة

---

## 🔥 خطوات التنفيذ (بالترتيب)

### المرحلة 1: إعداد MySQL (30 دقيقة)

#### 1.1 تثبيت MySQL
```bash
# حمّل من: https://dev.mysql.com/downloads/installer/
# اختر Development Computer
# اضبط كلمة مرور root
```

#### 1.2 إنشاء قاعدة البيانات
```bash
# افتح MySQL Command Line
CREATE DATABASE sakan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sakan_db;
SOURCE C:/Users/ali.salah/Desktop/sakan/database/schema_advanced.sql;

# إضافة حقول الإشعارات
SOURCE C:/Users/ali.salah/Desktop/sakan/database/add_notification_fields.sql;
```

#### 1.3 التحقق
```sql
USE sakan_db;
SHOW TABLES;
-- يجب أن ترى: customers, buildings, units, service_invoices, subscriptions, users, tenants

DESCRIBE subscriptions;
-- يجب أن ترى: notified_7days, notified_1day

DESCRIBE service_invoices;
-- يجب أن ترى: reminder_sent
```

---

### المرحلة 2: تشغيل Backend API (15 دقيقة)

#### 2.1 تحديث .env
```bash
cd C:\Users\ali.salah\Desktop\sakan\backend-api
notepad .env
```

**عدّل:**
```env
# MySQL
DB_PASSWORD=كلمة-مرور-MySQL-الخاصة-بك

# JWT (غيّر في الإنتاج!)
JWT_SECRET=super-secret-key-change-in-production-123456789

# Email (إذا كنت تريد تفعيل الإشعارات)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

#### 2.2 تشغيل السيرفر
```bash
npm run dev
```

**يجب أن ترى:**
```
✅ Database connected successfully
✅ Server running on port 5000
📍 Environment: development
🚀 Starting cron jobs...
✅ Cron jobs started successfully
```

#### 2.3 اختبار API
افتح متصفح:
```
http://localhost:5000/api/health
```

**يجب أن يرجع:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-..."
}
```

---

### المرحلة 3: تسجيل حساب Admin (10 دقائق)

#### 3.1 تسجيل حساب جديد
استخدم Postman أو Thunder Client:

```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "name": "مدير النظام",
  "email": "admin@sakan.com",
  "password": "Admin@123456",
  "phone": "0501234567",
  "address": "الرياض"
}
```

**احفظ الـ token من الاستجابة!**

#### 3.2 تحديث الدور إلى admin
```sql
USE sakan_db;
UPDATE customers SET role = 'admin' WHERE email = 'admin@sakan.com';
```

#### 3.3 إضافة اشتراك نشط
```sql
INSERT INTO subscriptions (customer_id, plan, amount, start_date, end_date, status, auto_renew)
VALUES (1, 'premium', 500, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'active', true);
```

---

### المرحلة 4: ربط Frontend بـ Backend (20 دقيقة)

#### 4.1 تحديث Login.jsx
```bash
cd C:\Users\ali.salah\Desktop\sakan\frontend\src\pages
```

في `Login.jsx`، استبدل:
```javascript
// القديم
axios.post('http://localhost:5000/auth/login', ...)

// بـ الجديد
import apiClient from '../config/apiClient';
import { API_ENDPOINTS } from '../config/api';

apiClient.post(API_ENDPOINTS.LOGIN, {
  email,
  password
}).then(response => {
  const { token, customer } = response.data.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(customer));
  // ...
});
```

#### 4.2 تحديث Buildings.jsx
```javascript
// القديم
axios.get('http://localhost:5000/buildings')

// بـ الجديد
import apiClient from '../config/apiClient';

apiClient.get('/buildings').then(response => {
  setBuildings(response.data.data);
});
```

#### 4.3 تكرار لباقي الصفحات
- Units.jsx
- ServiceInvoices.jsx
- MonthlySubscriptions.jsx
- CompanySubscriptions.jsx
- Dashboard.jsx
- MySubscription.jsx
- ... إلخ (8 صفحات متبقية)

---

### المرحلة 5: إعداد Email Notifications (30 دقيقة - اختياري)

#### 5.1 إنشاء App Password في Gmail
1. اذهب إلى: https://myaccount.google.com/apppasswords
2. اختر "Mail" و "Other (Custom name)"
3. اكتب "Sakan App"
4. انسخ الكلمة السرية (16 حرف)

#### 5.2 تحديث .env
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=سكن - Sakan <noreply@sakan.com>
FRONTEND_URL=http://localhost:3000
```

#### 5.3 اختبار الإشعارات
```javascript
// في backend-api/server.js أو في Postman
const { sendWelcomeEmail } = require('./utils/emailService');

sendWelcomeEmail({
  name: 'مدير النظام',
  email: 'admin@sakan.com'
});
```

---

### المرحلة 6: Payment Gateway (4-6 ساعات)

#### 6.1 التسجيل في Paymob
1. اذهب إلى: https://paymob.com/
2. سجّل حساب تاجر
3. احصل على API keys

#### 6.2 إنشاء Payment Routes
```bash
cd C:\Users\ali.salah\Desktop\sakan\backend-api
```

**إنشاء:** `routes/payments.js`
**إنشاء:** `controllers/paymentsController.js`

#### 6.3 إضافة صفحة Checkout في Frontend
**إنشاء:** `frontend/src/pages/Checkout.jsx`

**الكود الكامل متوفر عند الطلب**

---

### المرحلة 7: Automated Backups (1 ساعة)

#### 7.1 إنشاء مجلد Backups
```bash
mkdir C:\Users\ali.salah\Desktop\sakan\backend-api\backups
```

#### 7.2 إنشاء Backup Script
**إنشاء:** `backend-api/utils/backup.js`

```javascript
const cron = require('node-cron');
const { exec } = require('child_process');

cron.schedule('0 2 * * *', () => {
  const date = new Date().toISOString().split('T')[0];
  const command = `mysqldump -u root -pYOUR_PASSWORD sakan_db > backups/sakan_${date}.sql`;
  
  exec(command, (error) => {
    if (error) {
      console.error('Backup failed:', error);
    } else {
      console.log(`✅ Backup created: sakan_${date}.sql`);
    }
  });
});
```

---

### المرحلة 8: Testing (2-3 ساعات)

#### 8.1 Functional Testing
- ✅ تسجيل حساب جديد
- ✅ تسجيل الدخول
- ✅ إضافة مبنى
- ✅ إضافة وحدات
- ✅ إصدار فواتير
- ✅ احتساب اشتراكات شهرية
- ✅ تقارير الشركة

#### 8.2 Security Testing
- ✅ JWT token expiration
- ✅ Multi-tenancy isolation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Rate limiting

#### 8.3 Performance Testing
- ✅ Response times < 200ms
- ✅ Database queries optimized
- ✅ No memory leaks

---

### المرحلة 9: Production Deployment (1-2 أيام)

#### 9.1 استئجار VPS
- DigitalOcean: $5-10/شهر
- AWS Lightsail: $5/شهر
- Linode: $5/شهر

#### 9.2 إعداد السيرفر
```bash
# تثبيت Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت MySQL
sudo apt-get install mysql-server

# تثبيت Nginx
sudo apt-get install nginx

# تثبيت PM2
sudo npm install -g pm2
```

#### 9.3 نشر Backend
```bash
# رفع الكود
scp -r backend-api/* user@your-server:/var/www/sakan-api/

# تشغيل بـ PM2
pm2 start server.js --name sakan-api
pm2 save
pm2 startup
```

#### 9.4 إعداد Nginx
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

#### 9.5 SSL Certificate
```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

## 📊 Progress Checklist

### إعداد أساسي
- [ ] MySQL مثبت
- [ ] قاعدة البيانات موجودة
- [ ] Backend API يعمل
- [ ] حساب admin موجود

### ربط Frontend
- [ ] Login page محدّثة
- [ ] Buildings page محدّثة
- [ ] Units page محدّثة
- [ ] Invoices page محدّثة
- [ ] 7 صفحات متبقية محدّثة

### Features متقدمة
- [ ] Email notifications تعمل
- [ ] Cron jobs تعمل
- [ ] Payment gateway متكامل
- [ ] Automated backups تعمل

### Production
- [ ] VPS جاهز
- [ ] Domain + SSL
- [ ] Deployed to production
- [ ] Monitoring setup

---

## 🚨 المشاكل الشائعة وحلولها

### مشكلة: Can't connect to MySQL
```bash
# تحقق من تشغيل MySQL
Get-Service MySQL80
Start-Service MySQL80
```

### مشكلة: JWT token invalid
```javascript
// تأكد من JWT_SECRET في .env
// تأكد من إرسال token في header:
// Authorization: Bearer <token>
```

### مشكلة: CORS error
```javascript
// تأكد من FRONTEND_URL في .env
FRONTEND_URL=http://localhost:3000
```

### مشكلة: Email not sending
```javascript
// تأكد من App Password من Gmail
// تأكد من تفعيل "Less secure app access"
```

---

## الخطوة التالية

**ابدأ من المرحلة 1: إعداد MySQL**

راجع `MYSQL_SETUP.md` للتفاصيل الكاملة.
