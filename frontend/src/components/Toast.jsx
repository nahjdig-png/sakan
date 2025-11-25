import React, { useEffect } from 'react';
import './Toast.css';

function Toast({ message, type = 'info', duration = 3000, onClose, toasts, removeToast }) {
  // Hook must be called unconditionally
  useEffect(() => {
    if (onClose && !toasts) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, toasts]);

  // إذا كان Toast list (multiple toasts)
  if (toasts) {
    return (
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-icon">{getIcon(toast.type)}</span>
            <span className="toast-message">{toast.message}</span>
            {removeToast && (
              <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
            )}
          </div>
        ))}
      </div>
    );
  }

  // إذا كان Single toast
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{getIcon(type)}</span>
      <span className="toast-message">{message}</span>
      {onClose && <button className="toast-close" onClick={onClose}>×</button>}
    </div>
  );
}

function getIcon(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || 'ℹ️';
}

export default Toast;
