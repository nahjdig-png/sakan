const db = require('../config/database');

/**
 * Get all subscriptions (admin only)
 */
const getAll = async (req, res) => {
  const { status, plan } = req.query;

  let query = `
    SELECT s.*, c.name as customer_name, c.email as customer_email,
    (SELECT COUNT(*) FROM buildings WHERE customer_id = s.customer_id) as buildings_count
    FROM subscriptions s
    JOIN customers c ON s.customer_id = c.id
    WHERE 1=1
  `;
  
  const params = [];

  if (status) {
    query += ' AND s.status = ?';
    params.push(status);
  }

  if (plan) {
    query += ' AND s.plan = ?';
    params.push(plan);
  }

  query += ' ORDER BY s.end_date DESC';

  const [subscriptions] = await db.query(query, params);

  res.json({
    success: true,
    data: subscriptions
  });
};

/**
 * Get current customer's subscriptions
 */
const getMySubscriptions = async (req, res) => {
  const customerId = req.user.id;

  const [subscriptions] = await db.query(
    'SELECT * FROM subscriptions WHERE customer_id = ? ORDER BY end_date DESC',
    [customerId]
  );

  res.json({
    success: true,
    data: subscriptions
  });
};

/**
 * Get subscription plans
 */
const getPlans = async (req, res) => {
  const plans = [
    {
      id: 'basic',
      name: 'الخطة الأساسية',
      price: 200,
      duration: 'شهري',
      features: [
        'إدارة مبنى واحد',
        'حتى 20 وحدة',
        'دعم فني أساسي',
        'تقارير شهرية'
      ]
    },
    {
      id: 'standard',
      name: 'الخطة القياسية',
      price: 300,
      duration: 'شهري',
      features: [
        'إدارة حتى 3 مباني',
        'حتى 50 وحدة',
        'دعم فني متقدم',
        'تقارير مفصلة',
        'إشعارات آلية'
      ]
    },
    {
      id: 'premium',
      name: 'الخطة المتقدمة',
      price: 500,
      duration: 'شهري',
      features: [
        'إدارة غير محدودة للمباني',
        'وحدات غير محدودة',
        'دعم فني متميز 24/7',
        'تقارير مخصصة',
        'إشعارات متقدمة',
        'تطبيق جوال'
      ]
    },
    {
      id: 'enterprise',
      name: 'خطة الأعمال',
      price: 1200,
      duration: 'سنوي',
      features: [
        'جميع مزايا الخطة المتقدمة',
        'حسابات متعددة للمستخدمين',
        'تكامل مع الأنظمة الأخرى',
        'تدريب مخصص',
        'مدير حساب مخصص'
      ]
    }
  ];

  res.json({
    success: true,
    data: plans
  });
};

/**
 * Create new subscription (admin only)
 */
const create = async (req, res) => {
  const {
    customer_id,
    plan,
    amount,
    start_date,
    end_date,
    auto_renew
  } = req.body;

  // Validate required fields
  if (!customer_id || !plan || !amount || !start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: 'جميع الحقول مطلوبة'
    });
  }

  // Check if customer exists
  const [customers] = await db.query(
    'SELECT id FROM customers WHERE id = ?',
    [customer_id]
  );

  if (customers.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'العميل غير موجود'
    });
  }

  // Deactivate old subscriptions
  await db.query(
    `UPDATE subscriptions SET status = 'expired' 
     WHERE customer_id = ? AND status = 'active'`,
    [customer_id]
  );

  // Create new subscription
  const [result] = await db.query(
    `INSERT INTO subscriptions 
     (customer_id, plan, amount, start_date, end_date, status, auto_renew, created_at) 
     VALUES (?, ?, ?, ?, ?, 'active', ?, NOW())`,
    [customer_id, plan, amount, start_date, end_date, auto_renew || false]
  );

  res.status(201).json({
    success: true,
    message: 'تم إضافة الاشتراك بنجاح',
    data: {
      id: result.insertId,
      customer_id,
      plan,
      amount
    }
  });
};

/**
 * Renew subscription
 */
const renew = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  const { plan, amount, duration } = req.body;

  // Verify subscription belongs to customer (unless admin)
  let query = 'SELECT * FROM subscriptions WHERE id = ?';
  const params = [id];

  if (req.user.role !== 'admin') {
    query += ' AND customer_id = ?';
    params.push(customerId);
  }

  const [subscriptions] = await db.query(query, params);

  if (subscriptions.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'الاشتراك غير موجود'
    });
  }

  const subscription = subscriptions[0];
  const startDate = new Date();
  let endDate = new Date(startDate);

  // Calculate end date based on plan
  if (duration === 'yearly' || plan === 'enterprise') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  // Create new subscription
  await db.query(
    `INSERT INTO subscriptions 
     (customer_id, plan, amount, start_date, end_date, status, auto_renew, created_at) 
     VALUES (?, ?, ?, ?, ?, 'active', ?, NOW())`,
    [
      subscription.customer_id, 
      plan || subscription.plan, 
      amount || subscription.amount, 
      startDate, 
      endDate, 
      subscription.auto_renew
    ]
  );

  // Mark old subscription as expired
  await db.query(
    `UPDATE subscriptions SET status = 'expired' WHERE id = ?`,
    [id]
  );

  res.json({
    success: true,
    message: 'تم تجديد الاشتراك بنجاح'
  });
};

/**
 * Cancel subscription
 */
const cancel = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  // Verify subscription belongs to customer (unless admin)
  let query = 'SELECT * FROM subscriptions WHERE id = ?';
  const params = [id];

  if (req.user.role !== 'admin') {
    query += ' AND customer_id = ?';
    params.push(customerId);
  }

  const [subscriptions] = await db.query(query, params);

  if (subscriptions.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'الاشتراك غير موجود'
    });
  }

  await db.query(
    `UPDATE subscriptions SET status = 'cancelled', auto_renew = false WHERE id = ?`,
    [id]
  );

  res.json({
    success: true,
    message: 'تم إلغاء الاشتراك بنجاح'
  });
};

module.exports = {
  getAll,
  getMySubscriptions,
  getPlans,
  create,
  renew,
  cancel
};
