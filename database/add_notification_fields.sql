-- إضافة حقول للإشعارات في جدول subscriptions
ALTER TABLE subscriptions 
ADD notified_7days BOOLEAN DEFAULT FALSE,
ADD notified_1day BOOLEAN DEFAULT FALSE;

-- إضافة حقل للإشعارات في جدول service_invoices
ALTER TABLE service_invoices 
ADD reminder_sent BOOLEAN DEFAULT FALSE;

-- إضافة index لتحسين الأداء
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date, status);
CREATE INDEX idx_invoices_due_date ON service_invoices(due_date, status);
