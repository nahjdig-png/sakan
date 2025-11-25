import React from 'react';
import { hasPermission } from '../utils/permissions';

/**
 * مكون لحماية العناصر حسب الصلاحيات
 * يخفي العنصر إذا لم يكن للمستخدم صلاحية
 */
const PermissionGuard = ({ permission, children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user?.role || 'security';

  if (!hasPermission(permission, userRole)) {
    return null; // لا يعرض العنصر إذا لم تكن له صلاحية
  }

  return <>{children}</>;
};

/**
 * مكون لتعطيل العناصر بدون حذفها
 * يعطل الزر/الحقل إذا لم يكن للمستخدم صلاحية
 */
export const PermissionDisable = ({ permission, children, disabledText }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user?.role || 'security';

  const hasAccess = hasPermission(permission, userRole);

  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      disabled: !hasAccess,
      title: !hasAccess ? (disabledText || 'ليس لديك صلاحية') : children.props.title
    });
  }

  return children;
};

export default PermissionGuard;
