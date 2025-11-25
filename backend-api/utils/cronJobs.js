const cron = require('node-cron');
const db = require('../config/database');
const { sendSubscriptionExpiringEmail, sendInvoiceReminderEmail } = require('./emailService');

/**
 * فحص الاشتراكات المنتهية قريباً
 * يعمل يومياً الساعة 9 صباحاً
 */
const checkExpiringSubscriptions = cron.schedule('0 9 * * *', async () => {
  console.log('🔍 Checking expiring subscriptions...');
  
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // الاشتراكات التي ستنتهي خلال 7 أيام
    const [subscriptions] = await db.query(`
      SELECT s.*, c.name, c.email 
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      WHERE s.status = 'active'
      AND s.end_date <= ?
      AND s.end_date > NOW()
      AND s.notified_7days = false
    `, [sevenDaysFromNow]);

    for (const sub of subscriptions) {
      const daysLeft = Math.ceil((new Date(sub.end_date) - new Date()) / (1000 * 60 * 60 * 24));
      
      const user = { name: sub.name, email: sub.email };
      await sendSubscriptionExpiringEmail(user, sub, daysLeft);
      
      // تحديث حالة الإشعار
      await db.query('UPDATE subscriptions SET notified_7days = true WHERE id = ?', [sub.id]);
      
      console.log(`✅ Sent expiry notification to: ${sub.email}`);
    }

    console.log(`✅ Processed ${subscriptions.length} expiring subscriptions`);
  } catch (error) {
    console.error('❌ Error checking subscriptions:', error);
  }
}, {
  scheduled: false, // لن يبدأ تلقائياً
  timezone: 'Africa/Cairo'
});

/**
 * فحص الفواتير المتأخرة
 * يعمل يومياً الساعة 10 صباحاً
 */
const checkOverdueInvoices = cron.schedule('0 10 * * *', async () => {
  console.log('🔍 Checking overdue invoices...');
  
  try {
    const [invoices] = await db.query(`
      SELECT si.*, u.unit_number, b.name as building_name, c.name as customer_name, c.email
      FROM service_invoices si
      JOIN units u ON si.unit_id = u.id
      JOIN buildings b ON u.building_id = b.id
      JOIN customers c ON b.customer_id = c.id
      WHERE si.status = 'unpaid'
      AND si.due_date < NOW()
      AND si.reminder_sent = false
    `);

    for (const invoice of invoices) {
      const user = { name: invoice.customer_name, email: invoice.email };
      await sendInvoiceReminderEmail(user, invoice);
      
      // تحديث حالة الإشعار
      await db.query('UPDATE service_invoices SET reminder_sent = true WHERE id = ?', [invoice.id]);
      
      console.log(`✅ Sent invoice reminder to: ${invoice.email}`);
    }

    console.log(`✅ Processed ${invoices.length} overdue invoices`);
  } catch (error) {
    console.error('❌ Error checking invoices:', error);
  }
}, {
  scheduled: false,
  timezone: 'Africa/Cairo'
});

/**
 * تحديث حالة الاشتراكات المنتهية
 * يعمل يومياً منتصف الليل
 */
const updateExpiredSubscriptions = cron.schedule('0 0 * * *', async () => {
  console.log('🔍 Updating expired subscriptions...');
  
  try {
    const [result] = await db.query(`
      UPDATE subscriptions 
      SET status = 'expired' 
      WHERE status = 'active' 
      AND end_date < NOW()
    `);

    console.log(`✅ Updated ${result.affectedRows} expired subscriptions`);
  } catch (error) {
    console.error('❌ Error updating subscriptions:', error);
  }
}, {
  scheduled: false,
  timezone: 'Africa/Cairo'
});

/**
 * بدء جميع Cron Jobs
 */
const startCronJobs = () => {
  console.log('🚀 Starting cron jobs...');
  
  checkExpiringSubscriptions.start();
  checkOverdueInvoices.start();
  updateExpiredSubscriptions.start();
  
  console.log('✅ Cron jobs started successfully');
  console.log('   - Expiring subscriptions check: Daily at 9:00 AM');
  console.log('   - Overdue invoices check: Daily at 10:00 AM');
  console.log('   - Expired subscriptions update: Daily at 12:00 AM');
};

/**
 * إيقاف جميع Cron Jobs
 */
const stopCronJobs = () => {
  checkExpiringSubscriptions.stop();
  checkOverdueInvoices.stop();
  updateExpiredSubscriptions.stop();
  
  console.log('⏹️ Cron jobs stopped');
};

module.exports = {
  startCronJobs,
  stopCronJobs,
  checkExpiringSubscriptions,
  checkOverdueInvoices,
  updateExpiredSubscriptions
};
