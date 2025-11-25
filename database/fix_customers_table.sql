-- إضافة جدول customers للتوافق مع الكود الحالي
-- أو يمكن تحديث الكود ليستخدم users

USE sakan_db;

-- إنشاء جدول customers بناء على users مع الحقول المطلوبة
CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL COMMENT 'اسم العميل',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT 'البريد الإلكتروني',
  password VARCHAR(255) NOT NULL COMMENT 'كلمة المرور المشفرة',
  phone VARCHAR(20) COMMENT 'رقم الهاتف',
  address TEXT COMMENT 'العنوان',
  role ENUM('admin', 'manager', 'user') DEFAULT 'manager' COMMENT 'دور المستخدم',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' COMMENT 'حالة الحساب',
  subscription_status ENUM('active', 'expired', 'cancelled') DEFAULT 'active' COMMENT 'حالة الاشتراك',
  subscription_end_date DATE COMMENT 'تاريخ انتهاء الاشتراك',
  max_buildings INT DEFAULT 5 COMMENT 'الحد الأقصى للمباني',
  max_units INT DEFAULT 50 COMMENT 'الحد الأقصى للوحدات',
  notes TEXT COMMENT 'ملاحظات',
  last_login TIMESTAMP NULL COMMENT 'آخر دخول',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status),
  INDEX idx_subscription_status (subscription_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- تحديث جدول buildings ليشير إلى customers بدلاً من users
ALTER TABLE buildings 
  DROP FOREIGN KEY buildings_ibfk_1;

ALTER TABLE buildings 
  CHANGE COLUMN client_id customer_id INT NOT NULL COMMENT 'معرّف العميل';

ALTER TABLE buildings 
  ADD FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- تحديث جدول subscriptions ليشير إلى customers
ALTER TABLE subscriptions 
  DROP FOREIGN KEY subscriptions_ibfk_1;

ALTER TABLE subscriptions 
  CHANGE COLUMN user_id customer_id INT NOT NULL COMMENT 'معرّف العميل';

ALTER TABLE subscriptions 
  ADD FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- تحديث جدول payments ليشير إلى customers
ALTER TABLE payments 
  DROP FOREIGN KEY payments_ibfk_1;

ALTER TABLE payments 
  CHANGE COLUMN user_id customer_id INT NOT NULL COMMENT 'معرّف العميل';

ALTER TABLE payments 
  ADD FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- إدراج مستخدم تجريبي للعملاء
INSERT INTO customers (name, email, password, phone, role, status) VALUES 
('مدير النظام', 'admin@sakan.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/DiK', '01234567890', 'admin', 'active'),
('عميل تجريبي', 'customer@sakan.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/DiK', '01123456789', 'manager', 'active');

-- كلمة المرور للمستخدمين أعلاه هي: 123456