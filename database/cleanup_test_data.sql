-- ============================================================================
-- تنظيف بيانات الاختبار من قاعدة بيانات Sakan
-- Clean up test data from Sakan database
-- ============================================================================
-- جميع الحقوق محفوظة © 2025 شركة نهج للتحول الرقمي
-- All Rights Reserved © 2025 Nahj Digital Transformation Company
-- ============================================================================

USE sakan_db;

-- حذف جدول customers المؤقت (غير مستخدم)
DROP TABLE IF EXISTS customers;

-- حذف جميع بيانات الاختبار من الجداول
DELETE FROM notifications WHERE id > 0;
DELETE FROM expenses WHERE id > 0;
DELETE FROM maintenance_attachments WHERE id > 0;
DELETE FROM maintenance_requests WHERE id > 0;
DELETE FROM invoices WHERE id > 0;
DELETE FROM tenants WHERE id > 0;
DELETE FROM unit_owners WHERE id > 0;
DELETE FROM owners WHERE id > 0;
DELETE FROM payments WHERE id > 0;
DELETE FROM subscriptions WHERE id > 0;
DELETE FROM units WHERE id > 0;
DELETE FROM buildings WHERE id > 0;
DELETE FROM users WHERE id > 0;

-- إعادة تعيين auto_increment
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE expenses AUTO_INCREMENT = 1;
ALTER TABLE maintenance_attachments AUTO_INCREMENT = 1;
ALTER TABLE maintenance_requests AUTO_INCREMENT = 1;
ALTER TABLE invoices AUTO_INCREMENT = 1;
ALTER TABLE tenants AUTO_INCREMENT = 1;
ALTER TABLE unit_owners AUTO_INCREMENT = 1;
ALTER TABLE owners AUTO_INCREMENT = 1;
ALTER TABLE payments AUTO_INCREMENT = 1;
ALTER TABLE subscriptions AUTO_INCREMENT = 1;
ALTER TABLE units AUTO_INCREMENT = 1;
ALTER TABLE buildings AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- إضافة حساب المسؤول الافتراضي
-- Default admin account with strong password
INSERT INTO users (name, email, password, user_type, phone, status) 
VALUES (
  'مسؤول النظام',
  'admin@nahj.digital',
  '$2a$10$9XGKvEfZ8Y2Y4pN5xKvHMeqJ8xJz5rF5Z1Y2Y4pN5xKvHMeqJ8xJz5',  -- Password: Nahj@2025!
  'admin',
  '01000000000',
  'active'
);

-- إظهار النتائج
SELECT '✓ تم تنظيف قاعدة البيانات بنجاح' AS Status;
SELECT COUNT(*) AS 'عدد المستخدمين المتبقين' FROM users;
SELECT COUNT(*) AS 'عدد المباني المتبقية' FROM buildings;
