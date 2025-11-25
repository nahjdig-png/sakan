import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import './Auth.css';

const API_URL = API_BASE_URL;

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // البحث عن المستخدم في جدول users
      const userResponse = await axios.get(`${API_URL}/users`);
      const user = userResponse.data.find(
        u => u.email === formData.email && u.password === formData.password
      );
      
      if (user) {
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', 'user');
        
        // الانتقال إلى لوحة التحكم
        navigate('/');
        window.location.reload();
        return;
      }

      // البحث في جدول building_users (مدير النظام والموظفين)
      const buildingUsersResponse = await axios.get(`${API_URL}/building_users`);
      const buildingUser = buildingUsersResponse.data.find(
        u => u.email === formData.email && u.password === formData.password
      );
      
      if (buildingUser) {
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem('user', JSON.stringify(buildingUser));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', 'building_user');
        
        // الانتقال إلى لوحة التحكم
        navigate('/');
        window.location.reload();
        return;
      }

      // لم يتم العثور على المستخدم في أي من الجدولين
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>🏢 نظام سكن</h1>
          <h2>تسجيل الدخول</h2>
          <p>مرحباً بك! قم بتسجيل الدخول للوصول إلى حسابك</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="أدخل بريدك الإلكتروني"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="أدخل كلمة المرور"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="auth-footer">
          <p>ليس لديك حساب؟ <Link to="/register">سجل الآن</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
