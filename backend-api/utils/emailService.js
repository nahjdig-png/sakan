const nodemailer = require('nodemailer');

// إنشاء transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * إرسال email
 */
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'سكن - Sakan <noreply@sakan.com>',
      to,
      subject,
      html
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email ترحيبي بعد التسجيل
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 0.9rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 مرحباً بك في سكن</h1>
        </div>
        <div class="content">
          <h2>أهلاً ${user.name}!</h2>
          <p>نشكرك على تسجيلك في منصة سكن لإدارة العقارات.</p>
          <p>يمكنك الآن البدء في إضافة مبانيك ووحداتك وإدارة فواتيرك بكل سهولة.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">
            انتقل إلى لوحة التحكم
          </a>
          <h3>📊 خطط الاشتراك:</h3>
          <ul>
            <li><strong>الأساسية:</strong> 200 ج.م/شهر - مبنى واحد، 20 وحدة</li>
            <li><strong>القياسية:</strong> 300 ج.م/شهر - 3 مباني، 50 وحدة</li>
            <li><strong>المتقدمة:</strong> 500 ج.م/شهر - غير محدود</li>
            <li><strong>المؤسسات:</strong> 1200 ج.م/سنة - جميع المزايا</li>
          </ul>
        </div>
        <div class="footer">
          <p>© 2024 سكن - جميع الحقوق محفوظة</p>
          <p>للدعم الفني: support@sakan.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, '🎉 مرحباً بك في سكن', html);
};

/**
 * تنبيه انتهاء الاشتراك
 */
const sendSubscriptionExpiringEmail = async (user, subscription, daysLeft) => {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .warning { background: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 0.9rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ تنبيه انتهاء الاشتراك</h1>
        </div>
        <div class="content">
          <h2>عزيزي ${user.name},</h2>
          <div class="warning">
            <strong>⏰ اشتراكك سينتهي خلال ${daysLeft} يوم!</strong>
            <p>تاريخ الانتهاء: ${new Date(subscription.end_date).toLocaleDateString('ar-EG')}</p>
            <p>الباقة الحالية: ${subscription.plan}</p>
          </div>
          <p>لضمان استمرار الوصول إلى جميع مزايا النظام، يرجى تجديد اشتراكك في أقرب وقت.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-subscription" class="button">
            تجديد الاشتراك الآن
          </a>
        </div>
        <div class="footer">
          <p>© 2024 سكن - جميع الحقوق محفوظة</p>
          <p>للدعم الفني: support@sakan.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, `⚠️ اشتراكك سينتهي خلال ${daysLeft} يوم`, html);
};

/**
 * تأكيد الدفع
 */
const sendPaymentConfirmationEmail = async (user, payment) => {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .success { background: #d1fae5; border-right: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 0.9rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ تم الدفع بنجاح</h1>
        </div>
        <div class="content">
          <h2>عزيزي ${user.name},</h2>
          <div class="success">
            <strong>✅ تم تأكيد دفعتك بنجاح!</strong>
            <p>رقم العملية: ${payment.id}</p>
          </div>
          <div class="details">
            <h3>تفاصيل الدفعة:</h3>
            <p><strong>المبلغ:</strong> ${payment.amount} جنيه</p>
            <p><strong>الباقة:</strong> ${payment.plan}</p>
            <p><strong>تاريخ الدفع:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
            <p><strong>صالح حتى:</strong> ${new Date(payment.end_date).toLocaleDateString('ar-EG')}</p>
          </div>
          <p>شكراً لثقتك في منصة سكن! 🎉</p>
        </div>
        <div class="footer">
          <p>© 2024 سكن - جميع الحقوق محفوظة</p>
          <p>للدعم الفني: support@sakan.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, '✅ تأكيد الدفع - سكن', html);
};

/**
 * تذكير بفاتورة مستحقة
 */
const sendInvoiceReminderEmail = async (user, invoice) => {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .warning { background: #fee2e2; border-right: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 0.9rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ تذكير بفاتورة مستحقة</h1>
        </div>
        <div class="content">
          <h2>عزيزي ${user.name},</h2>
          <div class="warning">
            <strong>لديك فاتورة مستحقة الدفع</strong>
            <p>رقم الفاتورة: ${invoice.id}</p>
            <p>المبلغ: ${invoice.amount} جنيه</p>
            <p>تاريخ الاستحقاق: ${new Date(invoice.due_date).toLocaleDateString('ar-EG')}</p>
          </div>
          <p>يرجى سداد الفاتورة في أقرب وقت لتجنب أي انقطاع في الخدمة.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/invoices" class="button">
            عرض الفاتورة
          </a>
        </div>
        <div class="footer">
          <p>© 2024 سكن - جميع الحقوق محفوظة</p>
          <p>للدعم الفني: support@sakan.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, '⚠️ تذكير بفاتورة مستحقة - سكن', html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendSubscriptionExpiringEmail,
  sendPaymentConfirmationEmail,
  sendInvoiceReminderEmail
};
