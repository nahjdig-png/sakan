# دليل رفع التعديلات إلى GitHub

## المشكلة الحالية
Git غير مثبت على النظام. إليك الحلول:

## الحل الأول: تثبيت Git وتشغيل الأوامر

### 1. تحميل وتثبيت Git
- اذهب إلى: https://git-scm.com/download/win
- حمّل Git for Windows
- ثبته مع الإعدادات الافتراضية

### 2. بعد التثبيت، افتح PowerShell وشغل:

```powershell
# انتقل لمجلد المشروع
cd "c:\Users\ali.salah\Desktop\sakan"

# إعداد Git (إذا كانت أول مرة)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# إنشاء مستودع محلي
git init

# إضافة جميع الملفات
git add .

# إنشاء commit
git commit -m "Fix authentication system and API endpoints

- Fixed authController to use customers table
- Updated Login.jsx to use correct API endpoint
- Fixed API routes in server.js
- Updated constants.js with correct server URL
- Added test endpoints and user creation script
- Added setup scripts for deployment"

# ربط بمستودع GitHub الخاص بك
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# رفع التعديلات
git push -u origin main
```

## الحل الثاني: استخدام GitHub Desktop

1. حمّل [GitHub Desktop](https://desktop.github.com/)
2. سجل دخول بحسابك
3. File → Add Local Repository
4. اختر مجلد: `c:\Users\ali.salah\Desktop\sakan`
5. أكتب رسالة commit
6. اضغط Commit to main
7. اضغط Push origin

## الحل الثالث: رفع عبر المتصفح

1. اذهب لمستودعك على GitHub
2. اضغط "Upload files"
3. اسحب الملفات المعدلة:
   - `frontend/src/pages/Login.jsx`
   - `backend-api/controllers/authController.js`
   - `backend-api/server.js`
   - `frontend/src/config/constants.js`
   - `create-test-user.js`
   - `setup-server.ps1`
   - `setup-server.sh`
   - `SETUP_GUIDE.md`

## ملفات التعديلات الهامة

الملفات التي تم تعديلها وتحتاج رفع:

### ✅ Frontend:
- `src/pages/Login.jsx` - إصلاح المصادقة
- `src/config/constants.js` - عنوان API الصحيح
- ملفات أخرى تم تعديلها...

### ✅ Backend:
- `controllers/authController.js` - إصلاح مشاكل المصادقة
- `server.js` - إصلاح مسارات API
- `create-test-user.js` - إنشاء مستخدم تجريبي

### ✅ ملفات الإعداد:
- `setup-server.ps1` - إعداد تلقائي للويندوز
- `setup-server.sh` - إعداد تلقائي للينكس
- `SETUP_GUIDE.md` - دليل التشغيل

بمجرد رفع هذه التعديلات، سيكون النظام جاهز للعمل على السيرفر!