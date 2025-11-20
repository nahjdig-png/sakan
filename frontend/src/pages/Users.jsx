import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { API_BASE_URL } from '../config/constants';
import './Users.css';

const API_URL = API_BASE_URL;

function Users() {
  const [users, setUsers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'manager',
    building_id: '',
    status: 'active'
  });
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    const customerData = localStorage.getItem('user');
    if (customerData) {
      const customer = JSON.parse(customerData);
      setCurrentCustomer(customer);
      loadUsers(customer);
      loadBuildings(customer);
    }
  }, []);

  const loadUsers = async (customer) => {
    try {
      const response = await axios.get(`${API_URL}/building_users?customer_id=${customer.id}`);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading users:', err);
      error('فشل في تحميل المستخدمين');
      setLoading(false);
    }
  };

  const loadBuildings = async (customer) => {
    try {
      const response = await axios.get(`${API_URL}/buildings?customer_id=${customer.id}`);
      setBuildings(response.data);
    } catch (err) {
      console.error('Error loading buildings:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingUser && formData.password.length < 6) {
      error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    try {
      // التحقق من البريد الإلكتروني المكرر
      if (!editingUser) {
        const existing = await axios.get(`${API_URL}/building_users?email=${formData.email}`);
        if (existing.data.length > 0) {
          error('البريد الإلكتروني مستخدم بالفعل');
          return;
        }
      }

      const userData = {
        ...formData,
        customer_id: currentCustomer.id,
        created_at: editingUser ? editingUser.created_at : new Date().toISOString()
      };

      if (editingUser) {
        if (!formData.password) {
          delete userData.password; // عدم تحديث كلمة المرور إذا كانت فارغة
        }
        await axios.put(`${API_URL}/building_users/${editingUser.id}`, userData);
        success('✅ تم تحديث المستخدم بنجاح');
      } else {
        await axios.post(`${API_URL}/building_users`, userData);
        success('✅ تم إضافة المستخدم بنجاح');
      }
      
      loadUsers(currentCustomer);
      resetForm();
    } catch (err) {
      console.error('Error saving user:', err);
      error('❌ فشل في حفظ المستخدم');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await axios.delete(`${API_URL}/building_users/${id}`);
        loadUsers(currentCustomer);
        success('✅ تم حذف المستخدم بنجاح');
      } catch (err) {
        console.error('Error deleting user:', err);
        error('❌ فشل في حذف المستخدم');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
      building_id: user.building_id || '',
      status: user.status
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'manager',
      building_id: '',
      status: 'active'
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const getRoleName = (role) => {
    const roles = {
      admin: 'مدير النظام',
      manager: 'مدير عمارة',
      accountant: 'محاسب',
      security: 'أمن وحراسة'
    };
    return roles[role] || role;
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: '👑',
      manager: '🏢',
      accountant: '💰',
      security: '🛡️'
    };
    return icons[role] || '👤';
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      admin: 'role-badge-admin',
      manager: 'role-badge-manager',
      accountant: 'role-badge-accountant',
      security: 'role-badge-security'
    };
    return classes[role] || 'role-badge-default';
  };

  const getBuildingName = (id) => {
    if (!id) return 'جميع العمارات';
    const building = buildings.find(b => b.id === id);
    return building ? building.name : 'غير محدد';
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <span className="status-badge active">✅ نشط</span>
      : <span className="status-badge inactive">❌ معطل</span>;
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري تحميل المستخدمين...</p>
        </div>
      </div>
    );
  }

  // حساب إحصائيات المستخدمين
  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    accountant: users.filter(u => u.role === 'accountant').length,
    security: users.filter(u => u.role === 'security').length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1>👥 مستخدمي العمارات</h1>
          <p className="page-subtitle">إدارة المستخدمين (مدراء، محاسبين، فنيين)</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '✖️ إلغاء' : '➕ مستخدم جديد'}
        </button>
      </div>

      {/* إحصائيات المستخدمين */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>إجمالي المستخدمين</p>
          </div>
        </div>
        
        <div className="stat-card purple">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <h3>{stats.admin}</h3>
            <p>مدراء النظام</p>
          </div>
        </div>
        
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>نشطون</p>
          </div>
        </div>
        
        <div className="stat-card orange">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.manager + stats.accountant}</h3>
            <p>إداريون ومحاسبون</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingUser ? '✏️ تعديل مستخدم' : '➕ إضافة مستخدم جديد'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>الاسم الكامل *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="أدخل اسم المستخدم"
                />
              </div>

              <div className="form-group">
                <label>البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="example@domain.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>رقم الهاتف *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  placeholder="01000000000"
                />
              </div>

              <div className="form-group">
                <label>كلمة المرور {editingUser ? '(اتركها فارغة للإبقاء على القديمة)' : '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingUser}
                  placeholder="أدخل كلمة المرور"
                  minLength="6"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>الصلاحية *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="admin">👑 مدير النظام - كامل الصلاحيات</option>
                  <option value="manager">🏢 مدير عمارة - إدارة عمارة محددة</option>
                  <option value="accountant">💰 محاسب - إدارة الفواتير والمدفوعات</option>
                  <option value="security">🛡️ أمن وحراسة - مشاهدة فقط</option>
                </select>
                <small className="help-text">
                  {formData.role === 'admin' && '✓ كامل الصلاحيات على النظام'}
                  {formData.role === 'manager' && '✓ إضافة وتعديل البيانات لعمارة محددة'}
                  {formData.role === 'accountant' && '✓ إدارة الفواتير والاشتراكات والصندوق'}
                  {formData.role === 'security' && '✓ مشاهدة البيانات فقط'}
                </small>
              </div>

              <div className="form-group">
                <label>العمارة (اختياري)</label>
                <select
                  value={formData.building_id}
                  onChange={(e) => setFormData({...formData, building_id: e.target.value})}
                >
                  <option value="">جميع العمارات</option>
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>الحالة</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">نشط</option>
                  <option value="inactive">معطل</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-success">
                {editingUser ? '💾 حفظ التعديلات' : '➕ إضافة مستخدم'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                ✖️ إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-grid">
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>لا يوجد مستخدمين</h3>
            <p>ابدأ بإضافة مستخدمين لإدارة عماراتك</p>
          </div>
        ) : (
          users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {getRoleIcon(user.role)} {getRoleName(user.role)}
                  </span>
                </div>
                {getStatusBadge(user.status)}
              </div>

              <div className="user-details">
                <div className="detail-item">
                  <span className="icon">📧</span>
                  <span>{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="icon">📱</span>
                  <span>{user.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="icon">🏢</span>
                  <span>{getBuildingName(user.building_id)}</span>
                </div>
                <div className="detail-item">
                  <span className="icon">📅</span>
                  <span>
                    {new Date(user.created_at).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>

              <div className="user-actions">
                <button onClick={() => handleEdit(user)} className="btn-edit">
                  ✏️ تعديل
                </button>
                <button onClick={() => handleDelete(user.id)} className="btn-delete">
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default Users;
