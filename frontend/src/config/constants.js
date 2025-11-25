/**
 * تكوين ثوابت التطبيق
 * Application Constants Configuration
 */

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// App Information
export const APP_NAME = 'Sakan - منصة إدارة المباني';
export const APP_VERSION = '1.0.0';

// Subscription Plans (EGP)
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: 'الباقة الأساسية',
    price: 200,
    duration: 'شهري',
    features: [
      'إدارة حتى 5 عمارات',
      'إدارة الوحدات',
      'فواتير الخدمات',
      'الصندوق',
      'الدعم الفني'
    ]
  },
  PREMIUM: {
    name: 'الباقة المميزة',
    price: 400,
    duration: 'شهري',
    features: [
      'عدد عمارات غير محدود',
      'جميع ميزات الباقة الأساسية',
      'تقارير متقدمة',
      'نظام الإشعارات',
      'دعم فني أولوية'
    ]
  }
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant',
  SECURITY: 'security'
};

// Status Types
export const STATUS_TYPES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

// Date Formats
export const DATE_FORMAT = 'ar-EG';
export const DATE_OPTIONS = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Toast Notifications
export const TOAST_DURATION = 3000;
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  USER_TYPE: 'userType',
  THEME: 'theme'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // Buildings
  BUILDINGS: '/buildings',
  
  // Units
  UNITS: '/units',
  
  // Service Invoices
  SERVICE_INVOICES: '/service_invoices',
  SERVICE_TYPES: '/service_types',
  
  // Monthly Subscriptions
  MONTHLY_SUBSCRIPTIONS: '/monthly_subscriptions',
  
  // Cashbox
  CASHBOX: '/cashbox_transactions',
  
  // Users
  USERS: '/users',
  
  // System Subscriptions
  SUBSCRIPTIONS: '/subscriptions'
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_PATTERN: /^01[0-2,5]{1}[0-9]{8}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  POSITIVE_NUMBER: /^\d*\.?\d+$/
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
  UNAUTHORIZED: 'غير مصرح لك بالوصول',
  FORBIDDEN: 'ليس لديك صلاحية للقيام بهذا الإجراء',
  NOT_FOUND: 'العنصر المطلوب غير موجود',
  SERVER_ERROR: 'خطأ في الخادم',
  VALIDATION_ERROR: 'خطأ في التحقق من البيانات'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'تم الإضافة بنجاح',
  UPDATED: 'تم التحديث بنجاح',
  DELETED: 'تم الحذف بنجاح',
  SAVED: 'تم الحفظ بنجاح'
};

export default {
  API_BASE_URL,
  APP_NAME,
  APP_VERSION,
  SUBSCRIPTION_PLANS,
  USER_ROLES,
  STATUS_TYPES,
  API_ENDPOINTS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  TOAST_DURATION,
  TOAST_TYPES
};
