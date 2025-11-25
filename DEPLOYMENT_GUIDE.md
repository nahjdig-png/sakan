# دليل التنصيب والنشر - نظام Sakan

**جميع الحقوق محفوظة © 2025 شركة نهج للتحول الرقمي**

---

## 📋 المتطلبات الأساسية

- سيرفر Ubuntu 20.04/22.04 أو أعلى
- Docker و Docker Compose مثبتين
- منافذ متاحة: 4000 (Frontend), 5000 (Backend), 3306 (MySQL), 8888 (phpMyAdmin)
- 2GB RAM كحد أدنى
- 10GB مساحة تخزين

---

## 🚀 خطوات التنصيب السريعة

### 1. نقل المشروع للسيرفر

**من GitHub:**
```bash
ssh user@SERVER_IP
cd /opt
git clone https://github.com/nahjdig-png/sakan.git
cd sakan
```

**أو عبر النسخ المباشر:**
```bash
# من جهازك المحلي
tar -czf sakan.tar.gz --exclude=node_modules --exclude=database/data .
scp sakan.tar.gz user@SERVER_IP:/opt/

# على السيرفر
ssh user@SERVER_IP
cd /opt
tar -xzf sakan.tar.gz
```

### 2. إعداد ملف البيئة

```bash
cp .env.example .env
nano .env  # عدّل الإعدادات حسب الحاجة
```

### 3. تنفيذ سكربت التنصيب (أمر واحد!)

```bash
chmod +x install.sh
./install.sh
```

**انتهى!** السكربت سينفذ كل شيء تلقائياً:
- ✅ بناء وتشغيل الحاويات
- ✅ استيراد قاعدة البيانات
- ✅ إنشاء حساب المسؤول
- ✅ تفعيل الاشتراك

---

## 🔐 معلومات الدخول الافتراضية

**البريد الإلكتروني:** `admin@nahj.digital`  
**كلمة المرور:** `Nahj@2025!`  
**الدور:** مسؤول (Admin)

⚠️ **مهم:** غيّر كلمة المرور فوراً بعد أول تسجيل دخول!

---

## 🌐 الوصول للنظام

| الخدمة | الرابط | الوصف |
|--------|--------|-------|
| الواجهة الأمامية | `http://SERVER_IP:4000` | واجهة المستخدم |
| Backend API | `http://SERVER_IP:5000/api/health` | الواجهة البرمجية |
| phpMyAdmin | `http://SERVER_IP:8888` | إدارة قاعدة البيانات |

---

## 🛠️ أوامر مفيدة

```bash
# عرض حالة الحاويات
docker compose ps

# عرض السجلات المباشرة
docker compose logs -f

# عرض سجلات خدمة معينة
docker compose logs -f backend

# إعادة تشغيل خدمة معينة
docker compose restart backend

# إيقاف النظام
docker compose down

# إعادة البناء والتشغيل
docker compose up -d --build

# تنظيف البيانات وإعادة التنصيب
docker compose down -v
docker exec -i sakan-mysql mysql -u root -p < database/cleanup_test_data.sql
./install.sh
```

---

## 🔧 استكشاف الأخطاء

### مشكلة 404 Not Found على /api/customers

**السبب:** nginx لا يحوّل طلبات `/api` إلى Backend

**الحل:**
```bash
cd /opt/sakan
git pull origin main  # للحصول على آخر تحديثات nginx.conf
docker compose build --no-cache frontend
docker compose up -d frontend
```

### الحاوية لا تعمل

```bash
# عرض سجلات الخطأ
docker compose logs backend
docker compose logs mysql
docker compose logs frontend

# إعادة تشغيل الحاوية
docker compose restart CONTAINER_NAME
```

### مشاكل قاعدة البيانات

```bash
# الاتصال المباشر بـ MySQL
docker exec -it sakan-mysql mysql -u root -p

# عرض الجداول
docker exec -it sakan-mysql mysql -u root -p -e "USE sakan_db; SHOW TABLES;"

# تنظيف البيانات التجريبية
docker exec -i sakan-mysql mysql -u root -p < database/cleanup_test_data.sql
```

### Backend لا يستجيب

```bash
# التحقق من حالة الـ health check
curl http://localhost:5000/api/health

# عرض متغيرات البيئة
docker exec sakan-backend printenv | grep DB_

# إعادة بناء Backend
docker compose build --no-cache backend
docker compose up -d backend
```

---

## 📦 تحديث النظام

```bash
cd /opt/sakan

# جلب آخر التحديثات من GitHub
git pull origin main

# إعادة بناء الحاويات المحدّثة
docker compose build --no-cache

# إعادة التشغيل
docker compose up -d

# تطبيق تحديثات قاعدة البيانات (إن وجدت)
docker exec -i sakan-mysql mysql -u root -p < database/migrations/latest.sql
```

---

## 🔒 إعداد Domain و SSL (للإنتاج)

### 1. تثبيت Nginx و Certbot

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 2. إعداد Nginx كـ Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/sakan
```

محتوى الملف:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

تفعيل الإعداد:
```bash
sudo ln -s /etc/nginx/sites-available/sakan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. إصدار شهادة SSL مجانية

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

سيتم تجديد الشهادة تلقائياً كل 90 يوم.

---

## 📊 النسخ الاحتياطي

### نسخ احتياطي يدوي

```bash
# نسخ قاعدة البيانات
docker exec sakan-mysql mysqldump -u root -p sakan_db > backup_$(date +%Y%m%d).sql

# نسخ الملفات المرفوعة
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend-api/uploads/
```

### نسخ احتياطي تلقائي (Cron Job)

```bash
crontab -e
```

أضف هذا السطر للنسخ الاحتياطي يومياً عند الساعة 2 صباحاً:
```
0 2 * * * cd /opt/sakan && docker exec sakan-mysql mysqldump -u root -pYOUR_PASSWORD sakan_db > backups/backup_$(date +\%Y\%m\%d).sql
```

---

## 📝 ملاحظات مهمة

1. **كلمات المرور:** غيّر جميع كلمات المرور الافتراضية في `.env` قبل النشر
2. **Firewall:** تأكد من فتح المنافذ المطلوبة في جدار الحماية
3. **SSL:** استخدم HTTPS دائماً في الإنتاج
4. **Backup:** جدول نسخ احتياطية منتظمة
5. **Monitoring:** راقب السجلات بانتظام للكشف عن المشاكل مبكراً

---

## 📞 الدعم الفني

لأي استفسارات أو مساعدة تقنية:

**شركة نهج للتحول الرقمي**  
📧 البريد الإلكتروني: support@nahj.digital  
🌐 الموقع: www.nahj.digital

---

**جميع الحقوق محفوظة © 2025 شركة نهج للتحول الرقمي**
