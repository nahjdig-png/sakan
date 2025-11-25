-- Database Schema for Sakan Building Management Platform
-- Create database
CREATE DATABASE IF NOT EXISTS sakan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sakan_db;

-- ============================================================================
-- جدول المستخدمين
-- Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT 'اسم المستخدم',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT 'البريد الإلكتروني',
  password VARCHAR(255) NOT NULL COMMENT 'كلمة المرور المشفرة',
  user_type ENUM('admin', 'client') DEFAULT 'client' COMMENT 'نوع المستخدم',
  phone VARCHAR(20) COMMENT 'رقم الهاتف',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'حالة الحساب',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_user_type (user_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- جدول المباني
-- Buildings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS buildings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL COMMENT 'اسم المبنى',
  address TEXT NOT NULL COMMENT 'عنوان المبنى',
  total_units INT NOT NULL COMMENT 'إجمالي الوحدات',
  client_id INT NOT NULL COMMENT 'معرّف العميل',
  description TEXT COMMENT 'وصف المبنى',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'حالة المبنى',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_client_id (client_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- جدول الوحدات
-- Units Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS units (
  id INT PRIMARY KEY AUTO_INCREMENT,
  unit_number VARCHAR(50) NOT NULL COMMENT 'رقم الوحدة',
  building_id INT NOT NULL COMMENT 'معرّف المبنى',
  status ENUM('occupied', 'vacant') DEFAULT 'vacant' COMMENT 'حالة الوحدة',
  unit_type VARCHAR(50) COMMENT 'نوع الوحدة (شقة، محل، إلخ)',
  area DECIMAL(10, 2) COMMENT 'مساحة الوحدة',
  floor_number INT COMMENT 'رقم الطابق',
  rent_amount DECIMAL(10, 2) COMMENT 'قيمة الإيجار',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
  UNIQUE KEY unique_unit (building_id, unit_number),
  INDEX idx_building_id (building_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- جدول خطط الاشتراك
-- Plans Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  plan_name VARCHAR(100) NOT NULL COMMENT 'اسم الخطة',
  total_units INT NOT NULL COMMENT 'عدد الوحدات المدعومة',
  price DECIMAL(10, 2) NOT NULL COMMENT 'السعر بالعملة المحلية',
  currency VARCHAR(3) DEFAULT 'EGP' COMMENT 'العملة',
  description TEXT COMMENT 'وصف الخطة',
  features JSON COMMENT 'المميزات (JSON format)',
  billing_cycle VARCHAR(50) COMMENT 'دورة الفواتير (monthly, yearly)',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'حالة الخطة',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- جدول الدفعات
-- Payments Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'معرّف المستخدم',
  plan_id INT NOT NULL COMMENT 'معرّف الخطة',
  building_id INT COMMENT 'معرّف المبنى (اختياري)',
  amount DECIMAL(10, 2) NOT NULL COMMENT 'المبلغ المدفوع',
  currency VARCHAR(3) DEFAULT 'EGP' COMMENT 'العملة',
  payment_date DATE NOT NULL COMMENT 'تاريخ الدفع',
  next_payment_date DATE COMMENT 'تاريخ الدفع التالي',
  payment_method VARCHAR(50) COMMENT 'طريقة الدفع (credit_card, bank_transfer, etc.)',
  payment_status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending' COMMENT 'حالة الدفع',
  transaction_id VARCHAR(100) UNIQUE COMMENT 'معرّف المعاملة من بوابة الدفع',
  paymob_reference VARCHAR(100) COMMENT 'مرجع Paymob',
  notes TEXT COMMENT 'ملاحظات',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_plan_id (plan_id),
  INDEX idx_payment_status (payment_status),
  INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- جدول الاشتراكات النشطة
-- Active Subscriptions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'معرّف المستخدم',
  plan_id INT NOT NULL COMMENT 'معرّف الخطة',
  building_id INT NOT NULL COMMENT 'معرّف المبنى',
  start_date DATE NOT NULL COMMENT 'تاريخ بداية الاشتراك',
  end_date DATE COMMENT 'تاريخ نهاية الاشتراك',
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active' COMMENT 'حالة الاشتراك',
  renewal_date DATE COMMENT 'تاريخ تجديد الاشتراك',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_building_id (building_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Default Data / البيانات الافتراضية
-- ============================================================================

-- Insert default admin user
INSERT INTO users (name, email, password, user_type, phone, status) VALUES 
('مدير النظام', 'admin@sakan.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/DiK', 'admin', '01000000000', 'active');

-- Insert sample plans
INSERT INTO plans (plan_name, total_units, price, description, billing_cycle) VALUES 
('الخطة الأساسية', 10, 200, 'خطة مناسبة للمباني الصغيرة', 'monthly'),
('خطة متوسطة', 50, 500, 'خطة للمباني المتوسطة الحجم', 'monthly'),
('خطة متقدمة', 100, 1000, 'خطة للمباني الكبيرة مع ميزات متقدمة', 'monthly'),
('خطة سنوية', 50, 5000, 'دفع سنوي بخصم', 'yearly');
