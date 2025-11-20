const { verifyToken } = require('../utils/auth');
const db = require('../config/database');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'لم يتم العثور على رمز المصادقة'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const [users] = await db.query(
      'SELECT id, name, email, phone, role, status FROM customers WHERE id = ? AND status = "active"',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود أو غير نشط'
      });
    }

    // Attach user to request
    req.user = users[0];
    req.userId = users[0].id;
    req.userRole = users[0].role;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'رمز المصادقة غير صالح أو منتهي الصلاحية'
    });
  }
};

/**
 * Authorization Middleware
 * Checks if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'يجب تسجيل الدخول أولاً'
      });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد'
      });
    }

    next();
  };
};

/**
 * Check subscription status
 */
const checkSubscription = async (req, res, next) => {
  try {
    const [subscriptions] = await db.query(
      'SELECT * FROM subscriptions WHERE customer_id = ? AND status = "active" AND end_date > NOW() ORDER BY end_date DESC LIMIT 1',
      [req.userId]
    );

    if (subscriptions.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'اشتراكك منتهي. يرجى تجديد الاشتراك للمتابعة',
        subscriptionExpired: true
      });
    }

    req.subscription = subscriptions[0];
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من الاشتراك'
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  checkSubscription
};
