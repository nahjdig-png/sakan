import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import Owners from './pages/Owners';
import Units from './pages/Units';
import ServiceInvoices from './pages/ServiceInvoices';
import Users from './pages/Users';
import MonthlySubscriptions from './pages/MonthlySubscriptions';
import Cashbox from './pages/Cashbox';
import Subscriptions from './pages/Subscriptions';
import MySubscription from './pages/MySubscription';
import CompanySubscriptions from './pages/CompanySubscriptions';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import { hasPermission, getRoleLabel } from './utils/permissions';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userData = localStorage.getItem('user');
    
    if (loggedIn && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/login';
  };

  // مكون لحماية الصفحات
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // إذا لم يسجل دخول، عرض صفحات Landing/Login/Register فقط
  if (!isLoggedIn) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="app">
        <nav className="sidebar">
          <div className="logo">
            <h2>🏢 نظام سكن</h2>
          </div>
          
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name || 'مستخدم'}</p>
              <p className="user-role">{getRoleLabel(user?.role)}</p>
            </div>
          </div>

          <ul className="nav-menu">
            <li><Link to="/" className="nav-link">📊 لوحة التحكم</Link></li>
            {hasPermission('VIEW_BUILDINGS', user?.role) && (
              <li><Link to="/buildings" className="nav-link">🏢 المباني</Link></li>
            )}
            {hasPermission('VIEW_UNITS', user?.role) && (
              <li><Link to="/units" className="nav-link">🏠 الوحدات والملاك</Link></li>
            )}
            {hasPermission('VIEW_INVOICES', user?.role) && (
              <li><Link to="/invoices" className="nav-link">💰 فواتير الخدمات</Link></li>
            )}
            {hasPermission('VIEW_PAYMENT', user?.role) && (
              <li><Link to="/monthly-subscriptions" className="nav-link">🏠 اشتراكات الوحدات</Link></li>
            )}
            {hasPermission('VIEW_PAYMENT', user?.role) && (
              <li><Link to="/cashbox" className="nav-link">💼 الصندوق</Link></li>
            )}
            {hasPermission('VIEW_USERS', user?.role) && (
              <li><Link to="/users" className="nav-link">👤 المستخدمين</Link></li>
            )}
            {user?.role === 'admin' && (
              <li><Link to="/subscriptions" className="nav-link">⚙️ اشتراكات النظام</Link></li>
            )}
            {user?.role === 'admin' && (
              <li><Link to="/company-subscriptions" className="nav-link">💰 تقارير الاشتراكات</Link></li>
            )}
            <li><Link to="/my-subscription" className="nav-link">📱 اشتراكي</Link></li>
          </ul>

          <button onClick={handleLogout} className="logout-btn">
            🚪 تسجيل الخروج
          </button>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/buildings" element={<ProtectedRoute><Buildings /></ProtectedRoute>} />
            <Route path="/units" element={<ProtectedRoute><Units /></ProtectedRoute>} />
            <Route path="/owners" element={<ProtectedRoute><Owners /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><ServiceInvoices /></ProtectedRoute>} />
            <Route path="/monthly-subscriptions" element={<ProtectedRoute><MonthlySubscriptions /></ProtectedRoute>} />
            <Route path="/cashbox" element={<ProtectedRoute><Cashbox /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
            <Route path="/company-subscriptions" element={<ProtectedRoute><CompanySubscriptions /></ProtectedRoute>} />
            <Route path="/my-subscription" element={<ProtectedRoute><MySubscription /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
