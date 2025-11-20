const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

/**
 * Security Headers
 */
const securityHeaders = () => helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Rate Limiting
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'تم تجاوز عدد الطلبات المسموح بها. يرجى المحاولة لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiting for auth endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة'
  },
  skipSuccessfulRequests: true
});

/**
 * Input Sanitization
 */
const sanitizeInput = (field) => {
  return body(field)
    .trim()
    .escape()
    .notEmpty()
    .withMessage(`${field} is required`);
};

/**
 * Validate request
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'بيانات غير صالحة',
      errors: errors.array()
    });
  }
  
  next();
};

/**
 * Prevent SQL Injection (using prepared statements in queries)
 */
const sanitizeQuery = (query) => {
  // Remove dangerous SQL keywords
  const dangerousKeywords = [
    'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE',
    'EXEC', 'EXECUTE', 'SCRIPT', 'UNION', 'INSERT'
  ];
  
  let sanitized = query;
  dangerousKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized;
};

/**
 * XSS Protection
 */
const xssProtection = (req, res, next) => {
  // Clean all string inputs
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key]
        .replace(/[<>\"\']/g, '') // Remove dangerous characters
        .trim();
    }
  });
  
  next();
};

/**
 * CORS Configuration
 */
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

/**
 * Request Logger
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

module.exports = {
  securityHeaders,
  apiLimiter,
  authLimiter,
  sanitizeInput,
  validate,
  sanitizeQuery,
  xssProtection,
  corsOptions,
  requestLogger
};
