import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import './Auth.css';

const API_URL = API_BASE_URL;

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // التحقق من تطابق كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }

    // التحقق من قوة كلمة المرور
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      // التحقق من وجود البريد الإلكتروني
      const existingUser = await axios.get(`${API_URL}/customers?email=${formData.email}`);
      
      if (existingUser.data.length > 0) {
        setError('البريد الإلكتروني مسجل بالفعل');
        setLoading(false);
        return;
      }

      // تواريخ الاشتراك
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1); // شهر واحد

      // إنشاء عميل جديد
      const newCustomer = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'owner',
        subscription_plan: 'monthly',
        subscription_status: 'active',
        subscription_start: startDate.toISOString(),
        subscription_end: endDate.toISOString(),
        status: 'active',
        created_at: startDate.toISOString()
      };

      const response = await axios.post(`${API_URL}/customers`, newCustomer);
      
      if (response.data) {
        // إنشاء سجل اشتراك
        await axios.post(`${API_URL}/subscriptions`, {
          customer_id: response.data.id,
          plan: 'monthly',
          amount: 100,
          currency: 'EGP',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          auto_renew: true
        });

        // حفظ بيانات المستخدم
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('isLoggedIn', 'true');
        
        // الانتقال إلى لوحة التحكم
        navigate('/');
        window.location.reload();
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('حدث خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>🏢 نظام سكن</h1>
          <h2>إنشاء حساب جديد</h2>
          <p>انضم إلينا وابدأ في إدارة عقاراتك بسهولة</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>الاسم الكامل *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="أدخل اسمك الكامل"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>البريد الإلكتروني *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="example@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>رقم الهاتف</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="01xxxxxxxxx"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>تأكيد كلمة المرور *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="أعد إدخال كلمة المرور"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        <div className="auth-footer">
          <p>لديك حساب بالفعل؟ <Link to="/login">سجل الدخول</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
