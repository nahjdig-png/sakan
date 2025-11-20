# 🚀 دليل التشغيل السريع# 🚀 دليل البدء السريع - نظام سكن



## للتشغيل على Windows:## ⚡ التشغيل في 3 خطوات



### الطريقة 1: PowerShell (موصى بها)### الخطوة 1: افتح المجلد

```powershell```

# افتح PowerShell كـ Administrator📁 c:\Users\ali.salah\Desktop\sakan

cd C:\Users\ali.salah\Desktop\sakan```



# شغّل السكريبت### الخطوة 2: شغّل النظام

.\deploy-windows.ps1اضغط مرتين على:

``````

START.bat

### الطريقة 2: يدوياً```

```powershell

# 1. إنشاء .envسيتم فتح نافذتين:

cp .env.example .env- 🔵 Backend (Port 5000)

notepad .env- 🟢 Frontend (Port 3000)



# 2. بناء وتشغيل### الخطوة 3: سجّل الدخول

docker compose build```

docker compose up -dEmail: admin@sakan.local

Password: password

# 3. التحقق```

docker compose ps

```---



---## 📋 الميزات الجاهزة



## للتشغيل على Ubuntu Server:### ✅ المتوفرة الآن

- 👥 إدارة المستخدمين

### الطريقة 1: سكريبت تلقائي (موصى بها)- 🏢 إدارة المباني

```bash- 🏠 إدارة الوحدات

# 1. نقل المشروع للسيرفر- 👤 **إدارة الملاك** ⭐ جديد

scp -r sakan user@server-ip:/opt/- 🤝 **إدارة المستأجرين** ⭐ جديد

- 🔐 نظام مصادقة كامل

# 2. الاتصال بالسيرفر

ssh user@server-ip### ⏳ قريباً (Phase 2)

- 💰 نظام الفواتير

# 3. تشغيل السكريبت- 💳 نظام المدفوعات

cd /opt/sakan- 📊 التقارير المالية

sudo chmod +x deploy.sh- 🔧 نظام الصيانة

sudo bash deploy.sh

```---



### الطريقة 2: يدوياً## 🧪 اختبار النظام

```bash

# 1. تثبيت Docker### اختبار شامل

curl -fsSL https://get.docker.com -o get-docker.sh```powershell

sudo sh get-docker.shcd backend

node test-owners-tenants.js

# 2. إعداد المشروع```

cd /opt/sakan

cp .env.example .env### اختبار يدوي

nano .env1. افتح متصفح

2. اذهب إلى: `http://localhost:3000`

# 3. بناء وتشغيل3. سجّل الدخول

sudo docker compose build4. جرّب الميزات

sudo docker compose up -d

```---



---## 🔗 روابط مهمة



## 🔧 أوامر مهمة:### API Endpoints

```

### عرض الحالةBackend:  http://localhost:5000/api

```bashHealth:   http://localhost:5000/api/health

docker compose ps```

```

### الواجهة الأمامية

### عرض السجلات```

```bashFrontend: http://localhost:3000

docker compose logs -f```

docker compose logs -f backend

docker compose logs -f frontend---

```

## 📚 مستندات إضافية

### إعادة التشغيل

```bash### للتفاصيل الكاملة

docker compose restart- 📖 README.md - الوثائق الكاملة

```- 🗺️ DEVELOPMENT_PLAN.md - خطة التطوير

- 📝 SUMMARY.md - ملخص ما تم إنجازه

### إيقاف النظام

```bash### API Endpoints

docker compose down

```#### الملاك (Owners)

```

### تحديث النظامGET    /api/owners           - جلب كل الملاك

```bashPOST   /api/owners           - إضافة مالك

docker compose downGET    /api/owners/:id       - جلب مالك معين

docker compose build --no-cachePUT    /api/owners/:id       - تحديث مالك

docker compose up -dDELETE /api/owners/:id       - حذف مالك

``````



---#### المستأجرين (Tenants)

```

## 🌐 الروابط بعد التشغيل:GET    /api/tenants          - جلب كل المستأجرين

POST   /api/tenants          - إضافة مستأجر

### Windows:GET    /api/tenants/:id      - جلب مستأجر معين

- Frontend: http://localhostPUT    /api/tenants/:id      - تحديث مستأجر

- Backend API: http://localhost:5000POST   /api/tenants/:id/terminate  - إنهاء عقد

- phpMyAdmin: http://localhost:8080POST   /api/tenants/:id/renew      - تجديد عقد

```

### Ubuntu Server:

- Frontend: http://server-ip---

- Backend API: http://server-ip:5000

- phpMyAdmin: http://server-ip:8080## 🛠️ استكشاف الأخطاء



---### المشكلة: الخادم لا يعمل

```powershell

## ⚙️ إعدادات مهمة في .env:# أوقف جميع عمليات Node

Stop-Process -Name "node" -Force

```env

# قاعدة البيانات (تم توليدها تلقائياً)# أعد تشغيل START.bat

DB_PASSWORD=your_generated_password```



# JWT (تم توليدها تلقائياً)### المشكلة: Port مستخدم

JWT_SECRET=your_generated_secret```powershell

# غيّر Port في backend/.env

# Email (عدّل هذه!)PORT=5001

EMAIL_USER=your-email@gmail.com```

EMAIL_PASSWORD=your-app-password

### المشكلة: لا يمكن تسجيل الدخول

# Frontend URL (للسيرفر)```

FRONTEND_URL=http://your-domain.comتحقق من:

```1. الخادم يعمل (backend running)

2. البيانات صحيحة:

---   - admin@sakan.local / password

   - user@sakan.local / password

## 🔥 Firewall (للسيرفر):```



```bash---

# السماح بالبورتات

sudo ufw allow 22/tcp   # SSH## 💡 نصائح سريعة

sudo ufw allow 80/tcp   # HTTP

sudo ufw allow 443/tcp  # HTTPS### 1. البيانات التجريبية

sudo ufw allow 5000/tcp # Backend API- 2 مستخدمين (admin, user)

sudo ufw allow 8080/tcp # phpMyAdmin- 2 مبنى

sudo ufw enable- 2 مالك

```- 1 مستأجر



---### 2. إعادة تعيين البيانات

```powershell

## 📦 المحتويات:# أوقف الخادم ثم أعد تشغيله

# البيانات in-memory سيتم إعادة تحميلها

- `deploy.sh` - سكريبت Linux/Ubuntu```

- `deploy-windows.ps1` - سكريبت Windows

- `docker-compose.yml` - تعريف الـ containers### 3. إضافة بيانات جديدة

- `.env.example` - قالب الإعداداتاستخدم الواجهة الأمامية أو API مباشرة



------



## ✅ Checklist:## 📞 الدعم



- [ ] Docker مثبت ويعمل### مشكلة تقنية؟

- [ ] ملف .env تم إنشاؤه وتعديله1. راجع SUMMARY.md

- [ ] تم تشغيل السكريبت بنجاح2. جرّب test-owners-tenants.js

- [ ] جميع الـ containers تعمل (docker compose ps)3. تحقق من console logs

- [ ] يمكن الوصول للروابط

- [ ] تم تعديل إعدادات Email### تطوير جديد؟

راجع DEVELOPMENT_PLAN.md

---

---

## 🆘 في حالة المشاكل:

**الحالة:** ✅ جاهز للاستخدام

### المشكلة: Docker لا يعمل**الإصدار:** 1.1.0

```bash**آخر تحديث:** 2024

# Linux
sudo systemctl start docker
sudo systemctl status docker

# Windows
# تأكد من تشغيل Docker Desktop
```

### المشكلة: Port مستخدم
```bash
# إيقاف الـ container القديم
docker compose down

# أو تغيير البورت في docker-compose.yml
```

### المشكلة: خطأ في بناء الـ image
```bash
# حذف كل شيء وإعادة البناء
docker compose down -v
docker system prune -a
docker compose build --no-cache
```

---

**للدعم:** راجع `DOCKER_DEPLOYMENT.md` للتفاصيل الكاملة
