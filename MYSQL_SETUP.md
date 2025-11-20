# دليل إعداد MySQL - خطوة بخطوة

## الخطوة 1: تثبيت MySQL (إذا لم يكن مثبتاً)

### تحميل MySQL:
1. اذهب إلى: https://dev.mysql.com/downloads/installer/
2. حمّل MySQL Installer for Windows
3. اختر "Custom" Installation
4. حدد:
   - MySQL Server 8.0
   - MySQL Workbench (اختياري)

### أثناء التثبيت:
- اختر **Development Computer**
- اضبط كلمة مرور لـ root (مثال: `root123`)
- اترك Port: **3306**

---

## الخطوة 2: إنشاء قاعدة البيانات

### الطريقة 1: من MySQL Command Line
```bash
# افتح MySQL Command Line Client (من قائمة Start)
# أدخل كلمة مرور root

CREATE DATABASE sakan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sakan_db;
SOURCE C:/Users/ali.salah/Desktop/sakan/database/schema_advanced.sql;
```

### الطريقة 2: من PowerShell
```powershell
# افتح PowerShell كـ Administrator
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"

# إنشاء قاعدة البيانات
.\mysql -u root -p -e "CREATE DATABASE sakan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# تنفيذ schema
.\mysql -u root -p sakan_db < "C:\Users\ali.salah\Desktop\sakan\database\schema_advanced.sql"
```

### الطريقة 3: من MySQL Workbench (سهلة)
1. افتح MySQL Workbench
2. اتصل بـ Local instance
3. File → Open SQL Script
4. اختر `C:\Users\ali.salah\Desktop\sakan\database\schema_advanced.sql`
5. اضغط Execute (⚡)

---

## الخطوة 3: التحقق من إنشاء الجداول

```sql
USE sakan_db;
SHOW TABLES;

-- يجب أن ترى:
-- customers
-- buildings
-- units
-- service_invoices
-- subscriptions
-- users
-- tenants
```

---

## الخطوة 4: تحديث ملف .env

```bash
cd C:\Users\ali.salah\Desktop\sakan\backend-api
notepad .env
```

**عدّل السطر:**
```env
DB_PASSWORD=root123
# ضع كلمة مرور MySQL الخاصة بك هنا
```

---

## الخطوة 5: اختبار الاتصال

```powershell
cd C:\Users\ali.salah\Desktop\sakan\backend-api
npm run dev
```

**يجب أن ترى:**
```
✅ Database connected successfully
✅ Server running on port 5000
📍 Environment: development
```

---

## 🔥 إذا واجهت مشكلة "Access Denied"

```sql
-- افتح MySQL Command Line
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root123';
FLUSH PRIVILEGES;
```

---

## 🔥 إذا واجهت مشكلة "Can't connect to MySQL server"

1. **تحقق من تشغيل MySQL:**
```powershell
Get-Service MySQL*
# إذا كان Stopped:
Start-Service MySQL80
```

2. **تحقق من Port:**
```sql
SHOW VARIABLES LIKE 'port';
-- يجب أن يكون 3306
```

3. **تحقق من Firewall:**
- Windows Defender Firewall
- Allow port 3306 for MySQL

---

## الخطوة 6: إضافة بيانات تجريبية

بعد تشغيل السيرفر بنجاح:

### 1. تسجيل حساب admin:
```bash
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "name": "مدير النظام",
  "email": "admin@sakan.com",
  "password": "Admin@123456",
  "phone": "0501234567",
  "address": "الرياض، المملكة العربية السعودية"
}
```

### 2. تحديث الدور إلى admin (من MySQL):
```sql
USE sakan_db;
UPDATE customers SET role = 'admin' WHERE email = 'admin@sakan.com';
```

### 3. إضافة اشتراك نشط:
```sql
INSERT INTO subscriptions (customer_id, plan, amount, start_date, end_date, status, auto_renew, created_at)
VALUES (1, 'premium', 500, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'active', true, NOW());
```

---

## ✅ Checklist النجاح

- [ ] MySQL مثبت ويعمل
- [ ] قاعدة البيانات `sakan_db` موجودة
- [ ] جميع الجداول (7 جداول) موجودة
- [ ] ملف `.env` محدّث بكلمة المرور الصحيحة
- [ ] `npm install` اكتمل بنجاح
- [ ] `npm run dev` يعمل بدون أخطاء
- [ ] رسالة "Database connected successfully" ظهرت
- [ ] `http://localhost:5000/api/health` يرجع success

---

## الخطوة التالية

بعد اكتمال هذه الخطوات، انتقل إلى:
**تحديث Frontend لاستخدام Backend API الجديد**
