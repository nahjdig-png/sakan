-- جداول إضافية لنظام Sakan المتقدم
-- Additional tables for advanced Sakan system
-- Run this after the main schema.sql

USE sakan_db;

-- ============================================================================
-- جدول الملاك (Owners)
-- ============================================================================
CREATE TABLE IF NOT EXISTS owners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL COMMENT 'اسم المالك',
  email VARCHAR(100) UNIQUE COMMENT 'البريد الإلكتروني',
  phone VARCHAR(20) NOT NULL COMMENT 'رقم الهاتف',
  national_id VARCHAR(50) COMMENT 'رقم الهوية الوطنية',
  address TEXT COMMENT 'العنوان',
  city VARCHAR(100) COMMENT 'المدينة',
  country VARCHAR(100) DEFAULT 'مصر' COMMENT 'الدولة',
  owner_type ENUM('individual', 'company') DEFAULT 'individual' COMMENT 'نوع المالك',
  company_name VARCHAR(200) COMMENT 'اسم الشركة (إن وجد)',
  tax_number VARCHAR(50) COMMENT 'الرقم الضريبي',
  notes TEXT COMMENT 'ملاحظات',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'حالة المالك',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- جدول ربط الملاك بالوحدات (Unit Owners)
-- يدعم الملكية المشتركة - عدة ملاك للوحدة الواحدة
-- ============================================================================
CREATE TABLE IF NOT EXISTS unit_owners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  unit_id INT NOT NULL COMMENT 'معرّف الوحدة',
  owner_id INT NOT NULL COMMENT 'معرّف المالك',
  ownership_percentage DECIMAL(5, 2) DEFAULT 100.00 COMMENT 'نسبة الملكية %',
  start_date DATE NOT NULL COMMENT 'تاريخ بداية الملكية',
  end_date DATE COMMENT 'تاريخ نهاية الملكية',
  notes TEXT COMMENT 'ملاحظات',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE,
  UNIQUE KEY unique_owner_unit (unit_id, owner_id),
  INDEX idx_unit_id (unit_id),
  INDEX idx_owner_id (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- جدول المستأجرين (Tenants)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  unit_id INT NOT NULL COMMENT 'معرّف الوحدة',
  name VARCHAR(150) NOT NULL COMMENT 'اسم المستأجر',
  email VARCHAR(100) COMMENT 'البريد الإلكتروني',
  phone VARCHAR(20) NOT NULL COMMENT 'رقم الهاتف',
  national_id VARCHAR(50) COMMENT 'رقم الهوية',
  contract_start_date DATE NOT NULL COMMENT 'تاريخ بداية العقد',
  contract_end_date DATE NOT NULL COMMENT 'تاريخ نهاية العقد',
  monthly_rent DECIMAL(10, 2) NOT NULL COMMENT 'الإيجار الشهري',
  deposit_amount DECIMAL(10, 2) COMMENT 'مبلغ التأمين',
  payment_day INT DEFAULT 1 COMMENT 'يوم الدفع من كل شهر',
  notes TEXT COMMENT 'ملاحظات',
  emergency_contact_name VARCHAR(150) COMMENT 'اسم جهة الاتصال للطوارئ',
  emergency_contact_phone VARCHAR(20) COMMENT 'هاتف جهة الاتصال للطوارئ',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'حالة العقد',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  INDEX idx_unit_id (unit_id),
  INDEX idx_status (status),
  INDEX idx_contract_end_date (contract_end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- جدول الفواتير (Invoices)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL COMMENT 'رقم الفاتورة',
  unit_id INT NOT NULL COMMENT 'معرّف الوحدة',
  tenant_id INT COMMENT 'معرّف المستأجر',
  owner_id INT COMMENT 'معرّف المالك',
  invoice_type ENUM('rent', 'maintenance', 'utilities', 'other') DEFAULT 'rent' COMMENT 'نوع الفاتورة',
  amount DECIMAL(10, 2) NOT NULL COMMENT 'المبلغ',
  tax_amount DECIMAL(10, 2) DEFAULT 0 COMMENT 'الضريبة',
  total_amount DECIMAL(10, 2) NOT NULL COMMENT 'المبلغ الإجمالي',
  due_date DATE NOT NULL COMMENT 'تاريخ الاستحقاق',
  paid_date DATE COMMENT 'تاريخ الدفع',
  payment_method VARCHAR(50) COMMENT 'طريقة الدفع',
  status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending' COMMENT 'حالة الفاتورة',
  description TEXT COMMENT 'وصف الفاتورة',
  notes TEXT COMMENT 'ملاحظات',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
  FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE SET NULL,
  INDEX idx_unit_id (unit_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_owner_id (owner_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- جدول طلبات الصيانة (Maintenance Requests)
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_number VARCHAR(50) UNIQUE NOT NULL COMMENT 'رقم الطلب',
  unit_id INT NOT NULL COMMENT 'معرّف الوحدة',
  tenant_id INT COMMENT 'معرّف المستأجر',
  title VARCHAR(200) NOT NULL COMMENT 'عنوان الطلب',
  description TEXT NOT NULL COMMENT 'وصف المشكلة',
  category ENUM('plumbing', 'electrical', 'hvac', 'carpentry', 'cleaning', 'other') DEFAULT 'other' COMMENT 'فئة الصيانة',
  priority ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium' COMMENT 'الأولوية',
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT 'الحالة',
  assigned_to INT COMMENT 'المسؤول عن الصيانة',
  estimated_cost DECIMAL(10, 2) COMMENT 'التكلفة التقديرية',
  actual_cost DECIMAL(10, 2) COMMENT 'التكلفة الفعلية',
  scheduled_date DATE COMMENT 'تاريخ الموعد المحدد',
  completed_date DATE COMMENT 'تاريخ الإنجاز',
  notes TEXT COMMENT 'ملاحظات',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_unit_id (unit_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_assigned_to (assigned_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- جدول مرفقات الصيانة (Maintenance Attachments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  maintenance_id INT NOT NULL COMMENT 'معرّف طلب الصيانة',
  file_name VARCHAR(255) NOT NULL COMMENT 'اسم الملف',
  file_path VARCHAR(500) NOT NULL COMMENT 'مسار الملف',
  file_type VARCHAR(50) COMMENT 'نوع الملف',
  file_size INT COMMENT 'حجم الملف بالبايت',
  uploaded_by INT COMMENT 'معرّف من رفع الملف',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (maintenance_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_maintenance_id (maintenance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- جدول الإشعارات (Notifications)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'معرّف المستخدم المستلم',
  title VARCHAR(200) NOT NULL COMMENT 'عنوان الإشعار',
  message TEXT NOT NULL COMMENT 'نص الإشعار',
  notification_type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info' COMMENT 'نوع الإشعار',
  category ENUM('invoice', 'payment', 'maintenance', 'contract', 'announcement', 'other') DEFAULT 'other' COMMENT 'فئة الإشعار',
  related_id INT COMMENT 'معرّف العنصر المرتبط',
  related_type VARCHAR(50) COMMENT 'نوع العنصر المرتبط',
  is_read BOOLEAN DEFAULT FALSE COMMENT 'هل تم القراءة',
  read_at TIMESTAMP NULL COMMENT 'وقت القراءة',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- تحديث جدول الوحدات (Units) لدعم المزيد من التفاصيل
-- ============================================================================
ALTER TABLE units 
  ADD COLUMN IF NOT EXISTS area_sqm DECIMAL(10, 2) COMMENT 'المساحة بالمتر المربع',
  ADD COLUMN IF NOT EXISTS bedrooms INT COMMENT 'عدد غرف النوم',
  ADD COLUMN IF NOT EXISTS bathrooms INT COMMENT 'عدد الحمامات',
  ADD COLUMN IF NOT EXISTS monthly_rent DECIMAL(10, 2) COMMENT 'الإيجار الشهري',
  ADD COLUMN IF NOT EXISTS ownership_percentage DECIMAL(5, 2) DEFAULT 100.00 COMMENT 'نسبة الملكية الافتراضية',
  ADD COLUMN IF NOT EXISTS description TEXT COMMENT 'وصف الوحدة',
  MODIFY COLUMN status ENUM('occupied', 'vacant', 'maintenance', 'reserved') DEFAULT 'vacant',
  MODIFY COLUMN unit_type ENUM('apartment', 'shop', 'office', 'villa', 'warehouse', 'other') DEFAULT 'apartment';

-- ============================================================================
-- تحديث جدول المباني (Buildings)
-- ============================================================================
ALTER TABLE buildings
  ADD COLUMN IF NOT EXISTS city VARCHAR(100) COMMENT 'المدينة',
  ADD COLUMN IF NOT EXISTS floors INT COMMENT 'عدد الطوابق',
  ADD COLUMN IF NOT EXISTS year_built INT COMMENT 'سنة البناء',
  ADD COLUMN IF NOT EXISTS building_type ENUM('residential', 'commercial', 'mixed', 'villa') DEFAULT 'residential' COMMENT 'نوع المبنى';

-- ============================================================================
-- إنشاء جدول المصروفات (Expenses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  building_id INT NOT NULL COMMENT 'معرّف المبنى',
  expense_type ENUM('maintenance', 'utilities', 'security', 'cleaning', 'insurance', 'other') DEFAULT 'other' COMMENT 'نوع المصروف',
  amount DECIMAL(10, 2) NOT NULL COMMENT 'المبلغ',
  expense_date DATE NOT NULL COMMENT 'تاريخ المصروف',
  description TEXT COMMENT 'وصف المصروف',
  vendor_name VARCHAR(150) COMMENT 'اسم المورد',
  receipt_number VARCHAR(100) COMMENT 'رقم الإيصال',
  payment_method VARCHAR(50) COMMENT 'طريقة الدفع',
  notes TEXT COMMENT 'ملاحظات',
  created_by INT COMMENT 'المستخدم الذي أضاف المصروف',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_building_id (building_id),
  INDEX idx_expense_date (expense_date),
  INDEX idx_expense_type (expense_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- بيانات تجريبية للملاك (Sample Owners)
-- ============================================================================
INSERT INTO owners (name, email, phone, national_id, address, city, country, owner_type) VALUES
('أحمد محمد علي', 'ahmed@example.com', '01012345678', '28901012345678', 'شارع النيل، المعادي', 'القاهرة', 'مصر', 'individual'),
('سارة أحمد حسن', 'sara@example.com', '01123456789', '29201234567890', 'مدينة نصر', 'القاهرة', 'مصر', 'individual'),
('شركة العقارات المتقدمة', 'info@realestate.com', '0225551234', '1234567890', 'وسط البلد', 'القاهرة', 'مصر', 'company');

-- نهاية الملف
