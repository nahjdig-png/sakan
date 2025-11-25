# خطوات التشغيل بعد رفع GitHub

## 1. تحميل المشروع
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

## 2. إنشاء ملف البيئة
```bash
cp .env.example .env
```

## 3. تحرير ملف البيئة (اختياري)
```bash
nano .env
```
أو استخدم القيم الافتراضية

## 4. التشغيل التلقائي - ويندوز
```powershell
PowerShell -ExecutionPolicy Bypass -File setup-server.ps1
```

## 5. التشغيل التلقائي - لينكس/ماك
```bash
chmod +x setup-server.sh
./setup-server.sh
```

## 6. التشغيل اليدوي
```bash
# تشغيل الحاويات
docker-compose up -d

# انتظار 2-3 دقائق

# إضافة البيانات التجريبية
docker exec -it sakan-backend node scripts/create-sample-data.js
```

## 7. التحقق من التشغيل
```bash
docker ps
```

## 8. الوصول للنظام
- النظام: http://localhost:4000
- API: http://localhost:5000  
- قاعدة البيانات: http://localhost:8888

## 9. تسجيل الدخول
- البريد: admin@sakan.com
- كلمة المرور: 123456

## 10. للسيرفر الخارجي
غير في ملف `.env`:
```
FRONTEND_URL=http://157.173.198.72:4000
```

ثم أعد التشغيل:
```bash
docker-compose down
docker-compose up -d
```

## مشاكل محتملة
- تأكد من تشغيل Docker
- تأكد من توفر المنافذ: 3306, 4000, 5000, 8888
- انتظر اكتمال بناء الصور قبل الوصول للنظام