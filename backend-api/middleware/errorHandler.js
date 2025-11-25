/**
 * Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'رمز المصادقة غير صالح'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'انتهت صلاحية رمز المصادقة'
    });
  }

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'البيانات المدخلة موجودة بالفعل'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      success: false,
      message: 'البيانات المرجعية غير موجودة'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'خطأ في التحقق من البيانات',
      errors: err.errors
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'حدث خطأ في الخادم';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found Handler
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'المورد المطلوب غير موجود'
  });
};

/**
 * Async Handler Wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
