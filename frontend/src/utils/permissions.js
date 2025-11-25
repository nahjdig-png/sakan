// نظام الصلاحيات لكل دور في النظام

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant',
  SECURITY: 'security'
};

export const PERMISSIONS = {
  // صلاحيات المباني
  VIEW_BUILDINGS: ['admin', 'manager', 'accountant', 'security'],
  ADD_BUILDING: ['admin', 'manager'],
  EDIT_BUILDING: ['admin', 'manager'],
  DELETE_BUILDING: ['admin'],
  
  // صلاحيات الوحدات
  VIEW_UNITS: ['admin', 'manager', 'accountant', 'security'],
  ADD_UNIT: ['admin', 'manager'],
  EDIT_UNIT: ['admin', 'manager'],
  DELETE_UNIT: ['admin', 'manager'],
  
  // صلاحيات الملاك
  VIEW_OWNERS: ['admin', 'manager', 'accountant', 'security'],
  ADD_OWNER: ['admin', 'manager'],
  EDIT_OWNER: ['admin', 'manager'],
  DELETE_OWNER: ['admin', 'manager'],
  
  // صلاحيات الفواتير
  VIEW_INVOICES: ['admin', 'manager', 'accountant'],
  ADD_INVOICE: ['admin', 'manager', 'accountant'],
  EDIT_INVOICE: ['admin', 'manager', 'accountant'],
  DELETE_INVOICE: ['admin', 'manager'],
  MARK_PAID: ['admin', 'manager', 'accountant'],
  
  // صلاحيات الاشتراكات الشهرية والمدفوعات
  VIEW_PAYMENT: ['admin', 'manager', 'accountant'],
  ADD_PAYMENT: ['admin', 'manager', 'accountant'],
  EDIT_PAYMENT: ['admin', 'manager', 'accountant'],
  DELETE_PAYMENT: ['admin', 'manager'],
  
  // صلاحيات المستخدمين
  VIEW_USERS: ['admin', 'manager'],
  ADD_USER: ['admin', 'manager'],
  EDIT_USER: ['admin', 'manager'],
  DELETE_USER: ['admin']
};

/**
 * التحقق من صلاحية المستخدم
 * @param {string} permission - اسم الصلاحية
 * @param {string} userRole - دور المستخدم
 * @returns {boolean}
 */
export const hasPermission = (permission, userRole) => {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
};

/**
 * التحقق من عدة صلاحيات
 * @param {string[]} permissions - قائمة الصلاحيات
 * @param {string} userRole - دور المستخدم
 * @returns {boolean}
 */
export const hasAnyPermission = (permissions, userRole) => {
  return permissions.some(permission => hasPermission(permission, userRole));
};

/**
 * التحقق من جميع الصلاحيات
 * @param {string[]} permissions - قائمة الصلاحيات
 * @param {string} userRole - دور المستخدم
 * @returns {boolean}
 */
export const hasAllPermissions = (permissions, userRole) => {
  return permissions.every(permission => hasPermission(permission, userRole));
};

/**
 * الحصول على القوائم المسموح بها للمستخدم
 * @param {string} userRole - دور المستخدم
 * @returns {string[]}
 */
export const getAllowedMenus = (userRole) => {
  const menus = [];
  
  if (hasPermission('VIEW_BUILDINGS', userRole)) {
    menus.push('buildings');
  }
  if (hasPermission('VIEW_UNITS', userRole)) {
    menus.push('units');
  }
  if (hasPermission('VIEW_OWNERS', userRole)) {
    menus.push('owners');
  }
  if (hasPermission('VIEW_INVOICES', userRole)) {
    menus.push('invoices');
  }
  if (hasPermission('VIEW_USERS', userRole)) {
    menus.push('users');
  }
  
  return menus;
};

/**
 * وصف الدور بالعربي
 */
export const getRoleLabel = (role) => {
  const labels = {
    admin: 'مدير النظام',
    manager: 'مدير عمارة',
    accountant: 'محاسب',
    security: 'أمن وحراسة'
  };
  return labels[role] || 'مستخدم';
};
