# 🐳 نشر نظام سكن على Ubuntu + Docker + Portainer

## المتطلبات
- Ubuntu 20.04/22.04
- Docker Engine
- Docker Compose
- Portainer (اختياري - للإدارة المرئية)
- Domain name (اختياري - للـ SSL)

---

## الجزء 1: إعداد السيرفر

### 1.1 تحديث النظام
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 تثبيت Docker
```bash
# إزالة نسخ قديمة
sudo apt-get remove docker docker-engine docker.io containerd runc

# تثبيت المتطلبات
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# إضافة Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# إضافة Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# تثبيت Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# إضافة المستخدم الحالي لمجموعة docker
sudo usermod -aG docker $USER
newgrp docker

# التحقق من التثبيت
docker --version
docker compose version
```

### 1.3 تثبيت Portainer
```bash
# إنشاء volume لـ Portainer
docker volume create portainer_data

# تشغيل Portainer
docker run -d \
  -p 8000:8000 \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# افتح المتصفح على:
# https://your-server-ip:9443
# أنشئ حساب admin
```

---

## الجزء 2: رفع المشروع

### 2.1 نقل الملفات للسيرفر
```bash
# على جهازك المحلي (Windows PowerShell)
# ضغط المشروع
cd C:\Users\ali.salah\Desktop
Compress-Archive -Path sakan -DestinationPath sakan.zip

# رفع للسيرفر (استبدل user و server-ip)
scp sakan.zip user@your-server-ip:/home/user/

# أو استخدم FileZilla / WinSCP
```

### 2.2 على السيرفر Ubuntu
```bash
# فك الضغط
cd /home/user
unzip sakan.zip
cd sakan

# إنشاء ملف .env من المثال
cp .env.example .env
nano .env
```

**عدّل `.env`:**
```env
# كلمة مرور قوية لـ MySQL
DB_PASSWORD=MyStr0ng_P@ssw0rd_2024

# JWT Secrets (غيّرهم!)
JWT_SECRET=change-this-to-random-string-123456789
JWT_REFRESH_SECRET=change-this-to-another-random-string-987654321

# بيانات Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=سكن - Sakan <noreply@sakan.com>

# رابط الموقع (عدّله بعد شراء Domain)
FRONTEND_URL=http://your-server-ip
```

**احفظ:** `Ctrl+O` ثم `Enter` ثم `Ctrl+X`

---

## الجزء 3: تشغيل النظام

### 3.1 بناء وتشغيل الـ Containers
```bash
# بناء الصور
docker compose build

# تشغيل كل الخدمات
docker compose up -d

# متابعة السجلات (Logs)
docker compose logs -f

# للخروج من السجلات: Ctrl+C
```

### 3.2 التحقق من الخدمات
```bash
# عرض الـ Containers العاملة
docker compose ps

# يجب أن ترى:
# sakan-mysql       (healthy)
# sakan-backend     (healthy)
# sakan-frontend    (healthy)
# sakan-phpmyadmin  (running)
```

### 3.3 اختبار النظام
افتح المتصفح:
```
Frontend:      http://your-server-ip
Backend API:   http://your-server-ip:5000/api/health
phpMyAdmin:    http://your-server-ip:8080
Portainer:     https://your-server-ip:9443
```

---

## الجزء 4: إدارة عبر Portainer

### 4.1 الدخول لـ Portainer
```
https://your-server-ip:9443
```

### 4.2 إضافة Stack جديد
1. اذهب إلى **Stacks** → **Add stack**
2. اختر **Git Repository**
3. ضع رابط Git repo (أو استخدم **Web editor**)
4. الصق محتوى `docker-compose.yml`
5. اضبط **Environment variables** من `.env`
6. انقر **Deploy the stack**

### 4.3 إدارة الـ Containers
- **Start/Stop/Restart:** من Containers list
- **Logs:** انقر على Container ثم Logs
- **Console:** انقر على Container ثم Console (لفتح shell)
- **Stats:** عرض استهلاك CPU/RAM/Network

---

## الجزء 5: إعداد Domain + SSL (اختياري)

### 5.1 شراء Domain
- Namecheap.com
- GoDaddy.com
- Name.com

### 5.2 ربط DNS
في لوحة تحكم الـ Domain:
```
Type    Name    Value               TTL
A       @       your-server-ip      300
A       www     your-server-ip      300
```

### 5.3 تثبيت Nginx Proxy Manager (بديل Nginx + Certbot)
```bash
# docker-compose.nginx-proxy.yml
docker run -d \
  --name nginx-proxy-manager \
  --restart=always \
  -p 80:80 \
  -p 443:443 \
  -p 81:81 \
  -v npm_data:/data \
  -v npm_letsencrypt:/etc/letsencrypt \
  jc21/nginx-proxy-manager:latest

# افتح:
# http://your-server-ip:81
# Email: admin@example.com
# Password: changeme
```

### 5.4 إعداد Proxy Hosts
1. **Add Proxy Host**
2. **Domain:** yourdomain.com
3. **Scheme:** http
4. **Forward Hostname:** sakan-frontend
5. **Forward Port:** 80
6. **SSL:** ✅ Request SSL Certificate (Let's Encrypt)
7. **Force SSL:** ✅

كرر لـ:
- `api.yourdomain.com` → `sakan-backend:5000`
- `phpmyadmin.yourdomain.com` → `sakan-phpmyadmin:80`

---

## الجزء 6: أوامر إدارة مفيدة

### 6.1 عرض السجلات (Logs)
```bash
# كل الخدمات
docker compose logs -f

# خدمة محددة
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql

# آخر 100 سطر
docker compose logs --tail=100 backend
```

### 6.2 إعادة تشغيل الخدمات
```bash
# كل الخدمات
docker compose restart

# خدمة محددة
docker compose restart backend
docker compose restart frontend
```

### 6.3 إيقاف النظام
```bash
# إيقاف مؤقت (يحفظ البيانات)
docker compose stop

# إعادة التشغيل
docker compose start

# إيقاف وحذف الـ containers (يحفظ volumes)
docker compose down

# إيقاف وحذف كل شيء (بما فيه البيانات!)
docker compose down -v  # ⚠️ خطر!
```

### 6.4 تحديث النظام
```bash
# بعد تعديل الكود
git pull origin main

# إعادة بناء الصور
docker compose build

# إعادة تشغيل
docker compose up -d

# أو اختصار:
docker compose up -d --build
```

### 6.5 نسخ احتياطي للـ Database
```bash
# يدوي
docker exec sakan-mysql mysqldump -u root -p'your_password' sakan_db > backup_$(date +%Y%m%d).sql

# تلقائي (Cron job)
crontab -e
# أضف:
0 2 * * * docker exec sakan-mysql mysqldump -u root -p'your_password' sakan_db > /home/user/backups/sakan_$(date +\%Y\%m\%d).sql

# Restore
docker exec -i sakan-mysql mysql -u root -p'your_password' sakan_db < backup_20241120.sql
```

### 6.6 الدخول لـ Database Shell
```bash
# MySQL Console
docker exec -it sakan-mysql mysql -u root -p

# أو استخدم phpMyAdmin:
# http://your-server-ip:8080
```

### 6.7 الدخول لـ Container Shell
```bash
# Backend container
docker exec -it sakan-backend sh

# Frontend container
docker exec -it sakan-frontend sh

# MySQL container
docker exec -it sakan-mysql bash
```

---

## الجزء 7: المراقبة والأمان

### 7.1 مراقبة الموارد
```bash
# استهلاك الـ containers
docker stats

# حجم الصور
docker system df

# تنظيف الملفات القديمة
docker system prune -a
```

### 7.2 تأمين السيرفر
```bash
# Firewall (UFW)
sudo ufw enable
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 9443/tcp    # Portainer
sudo ufw status

# تحديث تلقائي
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 7.3 تغيير بورت Portainer (اختياري)
```bash
# إيقاف Portainer
docker stop portainer
docker rm portainer

# إعادة التشغيل على بورت مختلف
docker run -d \
  -p 8000:8000 \
  -p 9000:9000 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# الآن: http://your-server-ip:9000
```

---

## الجزء 8: Troubleshooting

### مشكلة: Container يتوقف باستمرار
```bash
# عرض آخر 50 سطر من السجل
docker compose logs --tail=50 backend

# التحقق من الـ exit code
docker inspect sakan-backend --format='{{.State.ExitCode}}'
```

### مشكلة: Can't connect to MySQL
```bash
# التحقق من MySQL health
docker compose ps mysql

# الدخول للـ MySQL container
docker exec -it sakan-mysql mysql -u root -p

# التحقق من البيانات
SHOW DATABASES;
USE sakan_db;
SHOW TABLES;
```

### مشكلة: Backend API لا يستجيب
```bash
# السجلات
docker compose logs backend

# التحقق من المتغيرات
docker exec sakan-backend env | grep DB

# إعادة التشغيل
docker compose restart backend
```

### مشكلة: Frontend لا يتصل بـ Backend
عدّل `frontend/src/config/api.js`:
```javascript
// Before build
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://your-server-ip:5000/api/v1';
```

ثم:
```bash
docker compose build frontend
docker compose up -d frontend
```

### مشكلة: بطء في الأداء
```bash
# زيادة موارد الـ containers
# عدّل docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          memory: 512M
```

---

## الجزء 9: Portainer Stacks (طريقة بديلة)

### 9.1 إنشاء Stack من Git
1. **Stacks** → **Add stack**
2. **Name:** sakan-production
3. **Build method:** Git Repository
4. **Repository URL:** (رابط Git repo الخاص بك)
5. **Repository reference:** main
6. **Compose path:** docker-compose.yml
7. **Environment variables:**
   ```
   DB_PASSWORD=your_password
   JWT_SECRET=your_secret
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_password
   FRONTEND_URL=http://your-domain
   ```
8. **Deploy the stack**

### 9.2 Auto-update من Git
في Portainer:
1. **Stack** → **sakan-production**
2. **Editor** → تفعيل **Git auto pull**
3. **Polling interval:** 5 minutes
4. **Save settings**

الآن كل push لـ Git سيحدث تحديث تلقائي للـ containers!

---

## الجزء 10: Production Checklist

### قبل النشر:
- [ ] كلمات المرور قوية في `.env`
- [ ] JWT_SECRET و JWT_REFRESH_SECRET محدّثة
- [ ] EMAIL_USER و EMAIL_PASSWORD صحيحة
- [ ] FRONTEND_URL يشير للدومين الصحيح
- [ ] Firewall مفعّل
- [ ] SSL Certificate مثبّت
- [ ] نسخة احتياطية تلقائية مفعّلة
- [ ] Monitoring setup (Portainer)

### بعد النشر:
- [ ] اختبار التسجيل والدخول
- [ ] اختبار إضافة مبنى ووحدات
- [ ] اختبار إصدار فواتير
- [ ] اختبار Email notifications
- [ ] اختبار الأداء (Load testing)
- [ ] التأكد من Cron jobs تعمل
- [ ] التحقق من Logs بانتظام

---

## الخلاصة

### الأوامر الأساسية:
```bash
# تشغيل النظام
docker compose up -d

# متابعة السجلات
docker compose logs -f

# إعادة تشغيل
docker compose restart

# إيقاف
docker compose down

# تحديث
docker compose up -d --build

# نسخ احتياطي
docker exec sakan-mysql mysqldump -u root -p sakan_db > backup.sql
```

### الروابط:
- Frontend: `http://your-server-ip`
- Backend API: `http://your-server-ip:5000`
- phpMyAdmin: `http://your-server-ip:8080`
- Portainer: `https://your-server-ip:9443`

**استمتع بإدارة سهلة مع Docker + Portainer! 🚀**
