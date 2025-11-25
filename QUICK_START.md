# خطوات التشغيل السريع

## 1. التحضير
```bash
git clone [repository-url]
cd sakan
```

## 2. إنشاء ملف البيئة
```bash
copy .env.example .env
```

## 3. التشغيل
```bash
docker-compose up -d
```

## 4. البيانات التجريبية
```bash
docker exec -it sakan-backend node scripts/create-sample-data.js
```

## 5. الوصول
- النظام: http://localhost:4000
- API: http://localhost:5000
- قاعدة البيانات: http://localhost:8888

## 6. تسجيل الدخول
- البريد: admin@sakan.com
- كلمة المرور: 123456

## تشغيل تلقائي (ويندوز)
```powershell
PowerShell -ExecutionPolicy Bypass -File setup-server.ps1
```

## تشغيل تلقائي (لينكس/ماك)
```bash
chmod +x setup-server.sh
./setup-server.sh
```