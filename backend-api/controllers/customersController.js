const db = require('../config/database');

/**
 * Get all customers (admin only)
 */
const getAll = async (req, res) => {
  const { status, role } = req.query;

  let query = `
    SELECT c.id, c.name, c.email, c.phone, c.address, c.role, c.status, c.created_at,
    (SELECT COUNT(*) FROM buildings WHERE customer_id = c.id) as buildings_count,
    (SELECT COUNT(*) FROM subscriptions WHERE customer_id = c.id AND status = 'active') as active_subscriptions
    FROM customers c
    WHERE 1=1
  `;
  
  const params = [];

  if (status) {
    query += ' AND c.status = ?';
    params.push(status);
  }

  if (role) {
    query += ' AND c.role = ?';
    params.push(role);
  }

  query += ' ORDER BY c.created_at DESC';

  const [customers] = await db.query(query, params);

  res.json({
    success: true,
    data: customers
  });
};

/**
 * Get customer statistics (admin only)
 */
const getStats = async (req, res) => {
  const [stats] = await db.query(`
    SELECT 
    (SELECT COUNT(*) FROM customers WHERE status = 'active') as active_customers,
    (SELECT COUNT(*) FROM customers WHERE status = 'inactive') as inactive_customers,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT SUM(amount) FROM subscriptions WHERE status = 'active') as total_revenue,
    (SELECT COUNT(*) FROM buildings) as total_buildings,
    (SELECT COUNT(*) FROM units) as total_units
  `);

  res.json({
    success: true,
    data: stats[0]
  });
};

/**
 * Get single customer by ID (admin only)
 */
const getById = async (req, res) => {
  const { id } = req.params;

  const [customers] = await db.query(
    `SELECT c.id, c.name, c.email, c.phone, c.address, c.role, c.status, c.created_at,
     (SELECT COUNT(*) FROM buildings WHERE customer_id = c.id) as buildings_count
     FROM customers c
     WHERE c.id = ?`,
    [id]
  );

  if (customers.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'العميل غير موجود'
    });
  }

  // Get customer's buildings
  const [buildings] = await db.query(
    'SELECT * FROM buildings WHERE customer_id = ?',
    [id]
  );

  // Get customer's subscriptions
  const [subscriptions] = await db.query(
    'SELECT * FROM subscriptions WHERE customer_id = ? ORDER BY end_date DESC',
    [id]
  );

  res.json({
    success: true,
    data: {
      ...customers[0],
      buildings,
      subscriptions
    }
  });
};

/**
 * Update customer (admin only)
 */
const update = async (req, res) => {
  const { id } = req.params;
  const { name, phone, address, role, status } = req.body;

  // Check if customer exists
  const [existing] = await db.query(
    'SELECT id FROM customers WHERE id = ?',
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'العميل غير موجود'
    });
  }

  const updates = [];
  const values = [];

  if (name) {
    updates.push('name = ?');
    values.push(name);
  }
  if (phone) {
    updates.push('phone = ?');
    values.push(phone);
  }
  if (address) {
    updates.push('address = ?');
    values.push(address);
  }
  if (role) {
    updates.push('role = ?');
    values.push(role);
  }
  if (status) {
    updates.push('status = ?');
    values.push(status);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'لا توجد بيانات للتحديث'
    });
  }

  values.push(id);

  await db.query(
    `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  res.json({
    success: true,
    message: 'تم تحديث العميل بنجاح'
  });
};

/**
 * Delete customer (admin only)
 */
const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  // Check if customer exists
  const [existing] = await db.query(
    'SELECT id FROM customers WHERE id = ?',
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'العميل غير موجود'
    });
  }

  // Check if customer has buildings
  const [buildings] = await db.query(
    'SELECT COUNT(*) as count FROM buildings WHERE customer_id = ?',
    [id]
  );

  if (buildings[0].count > 0) {
    return res.status(400).json({
      success: false,
      message: 'لا يمكن حذف العميل لأنه يمتلك مباني'
    });
  }

  await db.query('DELETE FROM customers WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'تم حذف العميل بنجاح'
  });
};

module.exports = {
  getAll,
  getStats,
  getById,
  update,
  delete: deleteCustomer
};
