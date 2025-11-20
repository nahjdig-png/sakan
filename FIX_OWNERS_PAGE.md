# 🔧 إصلاح صفحة Owners.jsx

## المشكلة
صفحة Owners.jsx تستخدم رابط API مباشر بدلاً من المتغير المركزي

## الحل (5 دقائق)

### الطريقة 1: التحديث اليدوي

افتح `frontend/src/pages/Owners.jsx`

**ابحث عن السطر 9:**
```javascript
const API_URL = 'http://localhost:5000';
```

**استبدله بـ:**
```javascript
import { API_BASE_URL } from '../config/constants';

const API_URL = API_BASE_URL;
```

**احفظ الملف:** `Ctrl+S`

---

### الطريقة 2: التحديث التلقائي (PowerShell)

```powershell
cd C:\Users\ali.salah\Desktop\sakan\frontend\src\pages

# قراءة الملف
$content = Get-Content Owners.jsx -Raw

# استبدال السطر
$content = $content -replace "import './Common.css';", @"
import { API_BASE_URL } from '../config/constants';
import './Common.css';
"@

$content = $content -replace "const API_URL = 'http://localhost:5000';", "const API_URL = API_BASE_URL;"

# حفظ التغييرات
Set-Content Owners.jsx $content

Write-Host "✅ تم تحديث Owners.jsx بنجاح!" -ForegroundColor Green
```

---

## التحقق

بعد التحديث، يجب أن يبدأ الملف هكذا:

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import PermissionGuard from '../components/PermissionGuard';
import { hasPermission } from '../utils/permissions';
import { API_BASE_URL } from '../config/constants';  // ⬅️ هذا السطر جديد
import './Common.css';

const API_URL = API_BASE_URL;  // ⬅️ تم التحديث

function Owners() {
  // ... باقي الكود
}
```

---

## الفائدة

### قبل:
```javascript
const API_URL = 'http://localhost:5000';
```
❌ يعمل فقط محلياً  
❌ يجب تغييره عند النشر  
❌ مختلف عن باقي الصفحات  

### بعد:
```javascript
import { API_BASE_URL } from '../config/constants';
const API_URL = API_BASE_URL;
```
✅ يعمل محلياً وعلى Production  
✅ مركزي (تحديث واحد في constants.js)  
✅ متسق مع باقي الصفحات  

---

## الخطوة التالية

بعد إصلاح Owners.jsx:
1. راجع `MYSQL_SETUP.md` لإعداد قاعدة البيانات
2. راجع `IMPLEMENTATION_GUIDE.md` لتشغيل النظام
3. أو راجع `DOCKER_DEPLOYMENT.md` للنشر المباشر

✅ النظام سيكون 100% جاهز!
