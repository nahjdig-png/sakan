-- نظام سكن المتكامل
USE sakan_db;

-- جدول المديرين
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'manager') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول العملاء/المستأجرين
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL,
    national_id VARCHAR(50) UNIQUE,
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- جدول المباني
CREATE TABLE buildings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    building_type ENUM('residential', 'commercial', 'mixed') DEFAULT 'residential',
    floors_count INT DEFAULT 1,
    units_count INT DEFAULT 1,
    description TEXT,
    facilities TEXT,
    manager_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- جدول الوحدات
CREATE TABLE units (
    id INT PRIMARY KEY AUTO_INCREMENT,
    building_id INT NOT NULL,
    unit_number VARCHAR(50) NOT NULL,
    floor_number INT,
    unit_type ENUM('studio', '1br', '2br', '3br', '4br', 'shop', 'office') NOT NULL,
    area DECIMAL(8,2),
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 1,
    rent_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2),
    utilities_included BOOLEAN DEFAULT FALSE,
    furnishing_status ENUM('furnished', 'semi_furnished', 'unfurnished') DEFAULT 'unfurnished',
    availability_status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    description TEXT,
    amenities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_unit (building_id, unit_number)
);

-- جدول عقود الإيجار
CREATE TABLE rental_contracts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    unit_id INT NOT NULL,
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    contract_status ENUM('active', 'expired', 'terminated', 'pending') DEFAULT 'pending',
    payment_due_day INT DEFAULT 1,
    notes TEXT,
    contract_file_path VARCHAR(500),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- جدول المدفوعات
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contract_id INT NOT NULL,
    payment_type ENUM('rent', 'deposit', 'utilities', 'maintenance', 'penalty') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'check', 'online') DEFAULT 'cash',
    payment_status ENUM('paid', 'pending', 'overdue', 'cancelled') DEFAULT 'pending',
    due_date DATE,
    receipt_number VARCHAR(100),
    notes TEXT,
    processed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES rental_contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- جدول صيانة
CREATE TABLE maintenance_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    unit_id INT NOT NULL,
    customer_id INT NOT NULL,
    request_type ENUM('plumbing', 'electrical', 'appliance', 'general', 'emergency') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    description TEXT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    cost DECIMAL(10,2) DEFAULT 0,
    scheduled_date DATE,
    completed_date DATE,
    notes TEXT,
    assigned_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES admins(id) ON DELETE SET NULL
);

-- إدراج البيانات الأساسية
-- مدير النظام الرئيسي
INSERT INTO admins (username, email, password, full_name, role) VALUES 
('admin', 'admin@sakan.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مدير النظام', 'super_admin'),
('manager1', 'manager1@sakan.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'أحمد محمد', 'manager'),
('manager2', 'manager2@sakan.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'سارة أحمد', 'manager');

-- عملاء تجريبيين
INSERT INTO customers (name, email, phone, national_id, address, created_by) VALUES 
('محمد علي أحمد', 'mohamed@email.com', '0501234567', '1234567890', 'الرياض - حي النفل', 1),
('فاطمة عبدالله', 'fatima@email.com', '0507654321', '0987654321', 'جدة - حي الروضة', 1),
('خالد سعد', 'khalid@email.com', '0512345678', '1122334455', 'الدمام - حي الشاطئ', 1),
('نورا محمد', 'nora@email.com', '0598765432', '5566778899', 'الرياض - حي العليا', 1);

-- مباني تجريبية
INSERT INTO buildings (name, address, building_type, floors_count, units_count, manager_id) VALUES 
('برج السكن الأول', 'الرياض - شارع الملك فهد', 'residential', 5, 20, 2),
('مجمع الأعمال التجاري', 'جدة - شارع التحلية', 'commercial', 3, 12, 3),
('برج النخيل السكني', 'الدمام - الكورنيش', 'residential', 8, 32, 2),
('مجمع الفنادق الذهبي', 'الرياض - حي الملز', 'mixed', 6, 24, 3);

-- وحدات سكنية
INSERT INTO units (building_id, unit_number, floor_number, unit_type, area, bedrooms, bathrooms, rent_amount, deposit_amount) VALUES 
-- برج السكن الأول
(1, 'A101', 1, '1br', 80.5, 1, 1, 2500.00, 2500.00),
(1, 'A102', 1, '2br', 120.0, 2, 2, 3500.00, 3500.00),
(1, 'A201', 2, '2br', 115.0, 2, 2, 3200.00, 3200.00),
(1, 'A301', 3, '3br', 150.0, 3, 2, 4500.00, 4500.00),
-- مجمع الأعمال التجاري  
(2, 'B101', 1, 'office', 60.0, 0, 1, 3000.00, 6000.00),
(2, 'B102', 1, 'shop', 45.0, 0, 1, 4000.00, 8000.00),
(2, 'B201', 2, 'office', 85.0, 0, 1, 4500.00, 9000.00),
-- برج النخيل السكني
(3, 'C101', 1, 'studio', 45.0, 0, 1, 1800.00, 1800.00),
(3, 'C102', 1, '1br', 75.0, 1, 1, 2300.00, 2300.00),
(3, 'C201', 2, '2br', 110.0, 2, 2, 3100.00, 3100.00),
(3, 'C301', 3, '3br', 140.0, 3, 2, 4200.00, 4200.00),
-- مجمع الفنادق الذهبي
(4, 'D101', 1, '1br', 70.0, 1, 1, 2800.00, 2800.00),
(4, 'D201', 2, '2br', 105.0, 2, 2, 3800.00, 3800.00),
(4, 'D301', 3, 'office', 90.0, 0, 2, 5000.00, 10000.00);

-- عقود إيجار تجريبية
INSERT INTO rental_contracts (customer_id, unit_id, contract_number, start_date, end_date, monthly_rent, deposit_amount, contract_status, created_by) VALUES 
(1, 1, 'CON-2024-001', '2024-01-01', '2024-12-31', 2500.00, 2500.00, 'active', 1),
(2, 6, 'CON-2024-002', '2024-02-01', '2025-01-31', 4000.00, 8000.00, 'active', 1),
(3, 8, 'CON-2024-003', '2024-03-01', '2025-02-28', 1800.00, 1800.00, 'active', 1),
(4, 12, 'CON-2024-004', '2024-04-01', '2025-03-31', 2800.00, 2800.00, 'active', 1);

-- مدفوعات تجريبية
INSERT INTO payments (contract_id, payment_type, amount, payment_date, payment_method, payment_status, processed_by) VALUES 
(1, 'deposit', 2500.00, '2024-01-01', 'bank_transfer', 'paid', 1),
(1, 'rent', 2500.00, '2024-01-01', 'bank_transfer', 'paid', 1),
(1, 'rent', 2500.00, '2024-02-01', 'bank_transfer', 'paid', 1),
(2, 'deposit', 8000.00, '2024-02-01', 'check', 'paid', 1),
(2, 'rent', 4000.00, '2024-02-01', 'check', 'paid', 1),
(3, 'deposit', 1800.00, '2024-03-01', 'cash', 'paid', 1),
(3, 'rent', 1800.00, '2024-03-01', 'cash', 'paid', 1),
(4, 'deposit', 2800.00, '2024-04-01', 'online', 'paid', 1),
(4, 'rent', 2800.00, '2024-04-01', 'online', 'paid', 1);

-- طلبات صيانة تجريبية
INSERT INTO maintenance_requests (unit_id, customer_id, request_type, priority, description, status, assigned_to) VALUES 
(1, 1, 'plumbing', 'medium', 'تسريب في حنفية المطبخ', 'pending', 2),
(6, 2, 'electrical', 'high', 'انقطاع في الكهرباء في المكتب', 'in_progress', 3),
(8, 3, 'appliance', 'low', 'عطل في المكيف', 'completed', 2),
(12, 4, 'general', 'medium', 'تنظيف عام للوحدة', 'pending', 3);