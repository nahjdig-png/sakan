const db = require('../config/database');
const { hashPassword } = require('../utils/auth');

/**
 * Get all users for current customer
 */
const getAll = async (req, res) => {
  const customerId = req.user.id;
  const { role } = req.query;

  let query = `
    SELECT id, customer_id, name, email, role, status, created_at
    FROM users
    WHERE customer_id = ?
  `;
  
  const params = [customerId];

  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }

  query += ' ORDER BY created_at DESC';

  const [users] = await db.query(query, params);

  res.json({
    success: true,
    data: users
  });
};

/**
 * Create new user
 */
const create = async (req, res) => {
  const customerId = req.user.id;
  const { name, email, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'جميع الحقول مطلوبة'
    });
  }

  // Check if email already exists
  const [existing] = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existing.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'البريد الإلكتروني مستخدم بالفعل'
    });
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const [result] = await db.query(
    `INSERT INTO users 
     (customer_id, name, email, password, role, status, created_at) 
     VALUES (?, ?, ?, ?, ?, 'active', NOW())`,
    [customerId, name, email, hashedPassword, role]
  );

  res.status(201).json({
    success: true,
    message: 'تم إضافة المستخدم بنجاح',
    data: {
      id: result.insertId,
      name,
      email,
      role
    }
  });
};

/**
 * Update user
 */
const update = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  const { name, email, password, role, status } = req.body;

  // Check if user exists and belongs to customer
  const [existing] = await db.query(
    'SELECT id FROM users WHERE id = ? AND customer_id = ?',
    [id, customerId]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'المستخدم غير موجود'
    });
  }

  const updates = [];
  const values = [];

  if (name) {
    updates.push('name = ?');
    values.push(name);
  }
  if (email) {
    updates.push('email = ?');
    values.push(email);
  }
  if (password) {
    const hashedPassword = await hashPassword(password);
    updates.push('password = ?');
    values.push(hashedPassword);
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

  values.push(id, customerId);

  await db.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND customer_id = ?`,
    values
  );

  res.json({
    success: true,
    message: 'تم تحديث المستخدم بنجاح'
  });
};

/**
 * Delete user
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  // Check if user exists and belongs to customer
  const [existing] = await db.query(
    'SELECT id FROM users WHERE id = ? AND customer_id = ?',
    [id, customerId]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'المستخدم غير موجود'
    });
  }

  await db.query(
    'DELETE FROM users WHERE id = ? AND customer_id = ?',
    [id, customerId]
  );

  res.json({
    success: true,
    message: 'تم حذف المستخدم بنجاح'
  });
};

module.exports = {
  getAll,
  create,
  update,
  delete: deleteUser
};
