# نظام سكن - Real Estate Management System# Sakan - Building Management Platform

## منصة سكن لإدارة المباني

نظام متكامل لإدارة العقارات السكنية يشمل إدارة المباني، الوحدات، الفواتير، والاشتراكات.

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)

---![License](https://img.shields.io/badge/license-MIT-green.svg)

![Language](https://img.shields.io/badge/language-Arabic%20RTL-red.svg)

## 📋 المحتويات![Status](https://img.shields.io/badge/status-Active%20Development-brightgreen.svg)



- [نظرة عامة](#نظرة-عامة)A comprehensive web-based property management platform with full Arabic (RTL) support, featuring user management, buildings and units handling, owners and tenants management, subscription plans, and payment integration.

- [الميزات](#الميزات)

- [البنية التقنية](#البنية-التقنية)منصة ويب شاملة لإدارة العقارات والمباني والوحدات مع دعم كامل للغة العربية واتجاه RTL، وتتضمن إدارة المستخدمين والملاك والمستأجرين والاشتراكات ومعالجة الدفعات.

- [التثبيت والتشغيل](#التثبيت-والتشغيل)

- [الوثائق](#الوثائق)---



---## 🌟 Key Features | الميزات الرئيسية



## 🎯 نظرة عامة✅ **Dual-Role Authentication** - Admin & Client User Types  

✅ **Building & Unit Management** - Full CRUD Operations  

**سكن** هو نظام SaaS متكامل لإدارة العقارات يستهدف:✅ **Owners Management** - Multi-ownership Support ⭐ NEW  

- أصحاب المباني السكنية✅ **Tenants & Contracts** - Full Lifecycle Management ⭐ NEW  

- شركات إدارة العقارات✅ **Flexible Subscription Plans** - Monthly & Yearly Options  

- المطورين العقاريين✅ **Payment Processing** - Paymob Integration Placeholder  

✅ **Arabic RTL Support** - Complete Localization  

---✅ **Responsive Design** - Mobile & Desktop Friendly  

✅ **Secure API** - JWT Authentication & Authorization  

## ✨ الميزات✅ **Real-time Notifications** - Toast Messages  



### إدارة العقارات---

- ✅ إدارة المباني (Buildings)

- ✅ إدارة الوحدات السكنية (Units)## 📋 Quick Start | البدء السريع

- ✅ تتبع حالة الوحدات (متاح، مؤجر، صيانة)

- ✅ إدارة المستأجرين (Tenants)### 1. Clone Repository

```bash

### المالية والفواتيرgit clone https://github.com/yourusername/sakan.git

- ✅ إصدار فواتير الخدماتcd sakan

- ✅ تتبع حالة الدفع```

- ✅ تقارير مالية تفصيلية

- ✅ إحصائيات الإيرادات### 2. Database Setup

```bash

### نظام الاشتراكات# Import database schema

- ✅ 4 خطط اشتراك (Basic, Standard, Premium, Enterprise)mysql -u root -p < database/schema.sql

- ✅ تتبع الاشتراكات وتواريخ الانتهاءmysql -u root -p < database/schema_advanced.sql

- ✅ تقارير إيرادات الشركة```

- ✅ تجديد تلقائي للاشتراكات

### 3. Backend Setup

### الأمان والصلاحيات```bash

- ✅ نظام مصادقة JWTcd backend

- ✅ 4 أدوار (Admin, Manager, Accountant, Security)npm install

- ✅ تشفير كلمات المرور (bcrypt)cp .env.example .env

- ✅ Rate limiting لحماية API# Edit .env with your database credentials

- ✅ حماية ضد XSS & SQL Injectionnpm run dev

```

### تقارير وإحصائيات

- ✅ لوحة معلومات شاملة### 4. Frontend Setup

- ✅ إحصائيات المباني والوحدات```bash

- ✅ تقارير الإيراداتcd frontend

- ✅ تصدير Excelnpm install

npm start

---```



## 🏗️ البنية التقنية### 5. Access Application

- **Frontend**: http://localhost:3000

### Frontend- **Backend API**: http://localhost:5000/api

- **Framework**: React 18.2.0- **Demo Account**:

- **Routing**: React Router 6.14.2  - Email: `admin@sakan.local`

- **HTTP Client**: Axios  - Password: `password`

- **Styling**: CSS3 مخصص

- **Language**: JavaScript (ES6+)---



### Backend API (Production)## 📁 Project Structure

- **Runtime**: Node.js 18+

- **Framework**: Express.js 4.18```

- **Database**: MySQL 8.0+sakan/

- **Authentication**: JWT (jsonwebtoken)├── backend/                  # Express.js Server (Node.js)

- **Security**: Helmet, express-rate-limit, express-validator│   ├── config/              # Database configuration

- **Password Hashing**: bcryptjs│   ├── middleware/          # Authentication & Authorization

- **Email**: NodeMailer (SMTP)│   ├── models/              # Database models

│   ├── routes/              # API endpoints

### Database│   ├── utils/               # Helper functions

- **MySQL** with advanced schema│   ├── server.js            # Main server file

- **Tables**: customers, buildings, units, service_invoices, subscriptions, users, tenants│   └── package.json

│

---├── frontend/                # React.js Application

│   ├── public/              # Static files

## 🚀 التثبيت والتشغيل│   ├── src/

│   │   ├── components/      # Reusable components

### المتطلبات│   │   ├── pages/           # Page components

- Node.js >= 18.0.0│   │   ├── context/         # Global state

- MySQL >= 8.0│   │   ├── services/        # API services

- npm أو yarn│   │   ├── styles/          # CSS files

│   │   ├── config/          # Configuration

### 1. إعداد قاعدة البيانات│   │   └── App.js

```bash│   └── package.json

# إنشاء قاعدة البيانات│

mysql -u root -p├── database/

CREATE DATABASE sakan_db;│   └── schema.sql           # Database schema

USE sakan_db;│

SOURCE database/schema_advanced.sql;├── docs/

```│   ├── README_AR.md         # Arabic documentation

│   ├── API_DOCUMENTATION.md # API reference

### 2. إعداد Backend API│   └── SETUP_GUIDE.md       # Detailed setup guide

```bash│

cd backend-api└── README.md (this file)

npm install```



# تحديث ملف .env---

# DB_PASSWORD=كلمة-مرور-MySQL

# JWT_SECRET=مفتاح-سري-قوي## 🔧 Tech Stack



npm run dev### Backend

# Server: http://localhost:5000- **Runtime**: Node.js v14+

```- **Framework**: Express.js

- **Database**: MySQL 5.7+

### 3. إعداد Frontend- **Authentication**: JWT (jsonwebtoken)

```bash- **Password Hashing**: bcryptjs

cd frontend- **Validation**: express-validator

npm install

npm start### Frontend

# App: http://localhost:3000- **Library**: React.js 18+

```- **Routing**: React Router v6

- **HTTP Client**: Axios

### 4. حساب تجريبي (بعد التسجيل)- **Styling**: CSS3 with RTL support

```sql- **Notifications**: React Toastify

-- تحديث الدور إلى admin

UPDATE customers SET role = 'admin' WHERE email = 'your-email@example.com';### Database

- **Tables**: Users, Buildings, Units, Plans, Payments, Subscriptions

-- إضافة اشتراك نشط- **Charset**: UTF-8 (Arabic support)

INSERT INTO subscriptions (customer_id, plan, amount, start_date, end_date, status)- **Relationships**: Proper foreign keys & constraints

VALUES (1, 'premium', 500, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'active');

```---



---## 📚 Documentation



## 📚 الوثائق- **[Arabic README](./docs/README_AR.md)** - Complete documentation in Arabic

- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Detailed API reference

### ملفات التوثيق- **[Setup Guide](./docs/SETUP_GUIDE.md)** - Comprehensive setup instructions

- **`SETUP_GUIDE.md`** - دليل الإعداد والتشغيل الكامل (عربي)

- **`دليل_الاستخدام.md`** - دليل استخدام النظام للمستخدم النهائي---

- **`backend-api/README.md`** - توثيق Backend API

## 🔐 Security Features

### API Documentation

راجع `backend-api/README.md` للحصول على:- **Password Encryption**: bcryptjs with salt rounds

- قائمة كاملة بـ API endpoints (46 endpoint)- **JWT Tokens**: Secure token-based authentication

- أمثلة على الطلبات والاستجابات- **Input Validation**: Server-side validation on all inputs

- تفاصيل المصادقة والصلاحيات- **Authorization Checks**: Role-based access control

- معالجة الأخطاء- **SQL Injection Prevention**: Prepared statements

- **CORS Protection**: Cross-origin resource sharing configured

---

---

## 📁 هيكل المشروع

## 📱 API Endpoints Overview

```

sakan/### Authentication

├── frontend/                # تطبيق React```

│   ├── src/POST   /api/auth/register

│   │   ├── components/     # مكونات ReactPOST   /api/auth/login

│   │   ├── pages/          # صفحات التطبيقPOST   /api/auth/forgot-password

│   │   ├── context/        # Context APIPOST   /api/auth/verify-token

│   │   └── services/       # خدمات API```

│   └── public/

├── backend-api/            # REST API (Production)### Users

│   ├── config/            # إعدادات قاعدة البيانات```

│   ├── controllers/       # منطق الأعمالGET    /api/users/me

│   ├── middleware/        # المصادقة والحمايةGET    /api/users (Admin)

│   ├── routes/            # تعريف المساراتPUT    /api/users/me/update

│   ├── utils/             # وظائف مساعدةDELETE /api/users/:id (Admin)

│   └── server.js          # نقطة البداية```

├── database/              # Database schemas

│   └── schema_advanced.sql### Buildings

├── db.json               # بيانات تجريبية (json-server)```

├── README.md             # هذا الملفGET    /api/buildings

├── SETUP_GUIDE.md        # دليل الإعدادGET    /api/buildings/:id

└── دليل_الاستخدام.md     # دليل الاستخدامPOST   /api/buildings

```PUT    /api/buildings/:id

DELETE /api/buildings/:id

---```



## 🔐 الأمان### Units

```

- **JWT Authentication** - مصادقة آمنة بتوكنGET    /api/units/building/:buildingId

- **Bcrypt Hashing** - تشفير كلمات المرور (10 rounds)POST   /api/units

- **Rate Limiting** - حماية من الهجمات (100 طلب/15 دقيقة)PUT    /api/units/:id

- **Helmet** - Security headersDELETE /api/units/:id

- **Input Validation** - التحقق من البيانات المدخلة```

- **XSS Protection** - حماية من Cross-Site Scripting

- **SQL Injection Prevention** - حماية قاعدة البيانات### Plans

```

---GET    /api/plans

POST   /api/plans (Admin)

## 💼 خطط الاشتراكPUT    /api/plans/:id (Admin)

DELETE /api/plans/:id (Admin)

| الخطة | السعر | المدة | المزايا |```

|------|------|------|---------|

| Basic | 200 ج.م | شهري | مبنى واحد، 20 وحدة |### Payments

| Standard | 300 ج.م | شهري | 3 مباني، 50 وحدة |```

| Premium | 500 ج.م | شهري | غير محدود + دعم 24/7 |POST   /api/payments/initiate

| Enterprise | 1200 ج.م | سنوي | كل المزايا + تدريب |POST   /api/payments/verify

POST   /api/payments/:id/simulate-completion

---GET    /api/payments/subscription/active

```

## 🤝 الدعم والمساعدة

---

للحصول على المساعدة:

1. راجع `SETUP_GUIDE.md` للإعداد الكامل## 🚀 Features in Detail

2. راجع `دليل_الاستخدام.md` لطريقة الاستخدام

3. تحقق من logs في console (Frontend و Backend)### 1. User Management

- Secure registration and login

---- Email verification (placeholder)

- Password reset functionality

## 📝 الترخيص- User profile management

- Role-based access control

جميع الحقوق محفوظة © 2024 - نظام سكن

### 2. Building Management
- Create, read, update, delete buildings
- Manage building information
- Automatic statistics calculation
- Building status tracking

### 3. Unit Management
- Add/edit/delete units
- Unit status (occupied/vacant)
- Unit details (type, area, floor, rent)
- Duplicate unit number prevention

### 4. Subscription Plans
- Create flexible subscription plans
- Multiple billing cycles
- Feature descriptions
- Admin-only plan management

### 5. Payment Processing
- Payment initiation
- Payment verification
- Subscription creation after successful payment
- Payment history tracking
- Paymob integration placeholder

### 6. Admin Dashboard
- System statistics
- User management
- Building management
- Payment tracking
- Plan management

### 7. Client Dashboard
- Personal building list
- Unit management for each building
- Active subscription view
- Payment history
- Statistics overview

---

## 🧪 Testing

### Demo Credentials
```
Email: admin@sakan.local
Password: password
```

### Test Payment Flow
1. Login with admin account
2. Navigate to Plans
3. Initiate a payment
4. Use simulate-completion endpoint for testing

---

## 🐛 Common Issues & Solutions

### Database Connection Error
```bash
# Ensure MySQL is running
mysql -u root -p
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### npm Install Issues
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

See [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) for more troubleshooting.

---

## 🔄 Next Steps / Development Roadmap

### Phase 2
- [ ] Advanced user management pages
- [ ] Building/Unit detailed management interface
- [ ] File upload and image handling
- [ ] Email notifications
- [ ] Data export (PDF, Excel)

### Phase 3
- [ ] Real Paymob integration
- [ ] Mobile application (React Native)
- [ ] Advanced analytics and charts
- [ ] Automated backups
- [ ] Multi-currency support

### Phase 4
- [ ] GraphQL API alternative
- [ ] System integrations (CRM, ERP)
- [ ] Advanced reporting
- [ ] Tenant portal
- [ ] Maintenance request system

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Contributors

- **Lead Developer**: Your Name
- **UI/UX Design**: Design Team
- **Testing**: QA Team

---

## 📞 Support & Contact

For questions, issues, or contributions:

- **Email**: support@sakan.local
- **Issues**: Create an issue on GitHub
- **Documentation**: Check `/docs` folder
- **API Docs**: `docs/API_DOCUMENTATION.md`

---

## 🌐 Deployment

### Production Checklist
- [ ] Change JWT_SECRET to a strong value
- [ ] Configure real database credentials
- [ ] Enable HTTPS
- [ ] Set NODE_ENV to production
- [ ] Configure real Paymob API keys
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up monitoring

### Deployment Platforms
- **Backend**: Heroku, AWS, DigitalOcean, Render
- **Frontend**: Vercel, Netlify, GitHub Pages, AWS
- **Database**: Amazon RDS, Google Cloud SQL, DigitalOcean

---

## 🎯 Key Highlights

✨ **Production-Ready**: Code structure suitable for scaling  
✨ **Well-Documented**: Comprehensive documentation in Arabic & English  
✨ **Secure**: JWT auth, password hashing, input validation  
✨ **Modular**: Easy to extend and maintain  
✨ **Localized**: Full Arabic RTL support  
✨ **Responsive**: Works on all devices  

---

## 📊 Project Statistics

- **Backend Files**: 15+ API route files
- **Frontend Components**: 10+ React components
- **Database Tables**: 7 tables with relationships
- **API Endpoints**: 40+ endpoints
- **Lines of Code**: 5000+
- **Documentation**: 3 comprehensive guides

---

**Last Updated**: November 2024  
**Status**: MVP v1.0 Ready for Production

---

<div align="center">

Made with ❤️ for Building Management  

[⬆ Back to top](#sakan---building-management-platform)

</div>
