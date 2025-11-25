const db = require('../config/database');
const { generateToken, hashPassword, comparePassword, verifyToken } = require('../utils/auth');

/**
 * Register new customer
 */
const register = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة'
    });
  }

  // Check if email already exists
  const [existing] = await db.query(
    'SELECT id FROM customers WHERE email = ?',
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

  // Create customer
  const [result] = await db.query(
    `INSERT INTO customers (name, email, password, phone, address, role, status, created_at) 
     VALUES (?, ?, ?, ?, ?, 'manager', 'active', NOW())`,
    [name, email, hashedPassword, phone, address]
  );

  const customerId = result.insertId;

  // Generate token
  const token = generateToken({ 
    id: customerId, 
    email, 
    role: 'manager' 
  });

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الحساب بنجاح',
    data: {
      customer: {
        id: customerId,
        name,
        email,
        phone,
        role: 'manager'
      },
      token
    }
  });
};

/**
 * Login customer
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'البريد الإلكتروني وكلمة المرور مطلوبة'
    });
  }

  // Find customer
  const [customers] = await db.query(
    'SELECT * FROM customers WHERE email = ?',
    [email]
  );

  if (customers.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'بيانات الدخول غير صحيحة'
    });
  }

  const customer = customers[0];

  // Check if account is active
  if (customer.status !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'حسابك معطل. يرجى التواصل مع الدعم'
    });
  }

  // Verify password
  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'بيانات الدخول غير صحيحة'
    });
  }

  // Check subscription
  const [subscriptions] = await db.query(
    `SELECT * FROM subscriptions 
     WHERE user_id = ? 
     AND status = 'active' 
     AND end_date > NOW() 
     ORDER BY end_date DESC 
     LIMIT 1`,
    [user.id]
  );

  const hasActiveSubscription = subscriptions.length > 0;

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    hasSubscription: hasActiveSubscription
  });

  res.json({
    success: true,
    message: 'تم تسجيل الدخول بنجاح',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        hasSubscription: hasActiveSubscription
      },
      token
    }
  });
};

/**
 * Get current user info
 */
const getMe = async (req, res) => {
  const userId = req.user.id;

  const [users] = await db.query(
    'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'المستخدم غير موجود'
    });
  }

  res.json({
    success: true,
    data: users[0]
  });
};

/**
 * Refresh token
 */
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'رمز التحديث مطلوب'
    });
  }

  // Verify refresh token
  const decoded = verifyToken(refreshToken);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'رمز التحديث غير صالح'
    });
  }

  // Generate new access token
  const newToken = generateToken({
    id: decoded.id,
    email: decoded.email,
    role: decoded.role
  });

  res.json({
    success: true,
    data: { token: newToken }
  });
};

/**
 * Logout
 */
const logout = async (req, res) => {
  // In a real implementation, you would blacklist the token here
  res.json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح'
  });
};

/**
 * Update profile
 */
const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, phone, address } = req.body;

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

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'لا توجد بيانات للتحديث'
    });
  }

  values.push(userId);

  await db.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  res.json({
    success: true,
    message: 'تم تحديث الملف الشخصي بنجاح'
  });
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'كلمة المرور الحالية والجديدة مطلوبة'
    });
  }

  // Get current password
  const [users] = await db.query(
    'SELECT password FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'المستخدم غير موجود'
    });
  }

  // Verify current password
  const isMatch = await comparePassword(currentPassword, users[0].password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'كلمة المرور الحالية غير صحيحة'
    });
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await db.query(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, userId]
  );

  res.json({
    success: true,
    message: 'تم تغيير كلمة المرور بنجاح'
  });
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  logout,
  updateProfile,
  changePassword
};
