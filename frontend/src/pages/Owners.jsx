import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import PermissionGuard from '../components/PermissionGuard';
import { hasPermission } from '../utils/permissions';
import { API_BASE_URL } from '../config/constants';
import './Common.css';

const API_URL = API_BASE_URL;

function Owners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { toasts, removeToast, success, error } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    national_id: '',
    address: '',
    city: 'القاهرة',
    country: 'مصر',
    owner_type: 'individual',
    company_name: '',
    tax_number: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(userData);
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      const response = await axios.get(`${API_URL}/unit_owners`);
      setOwners(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading owners:', err);
      error('❌ فشل في تحميل البيانات');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/unit_owners/${editingId}`, formData);
        success('✅ تم تحديث المالك بنجاح');
      } else {
        await axios.post(`${API_URL}/unit_owners`, formData);
        success('✅ تم إضافة المالك بنجاح');
      }
      resetForm();
      loadOwners();
    } catch (err) {
      console.error('Error saving owner:', err);
      error('❌ فشل في حفظ البيانات');
    }
  };

  const handleEdit = (owner) => {
    setFormData(owner);
    setEditingId(owner.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المالك؟')) {
      try {
        await axios.delete(`${API_URL}/unit_owners/${id}`);
        success('✅ تم حذف المالك بنجاح');
        loadOwners();
      } catch (err) {
        console.error('Error deleting owner:', err);
        error('❌ فشل في حذف المالك');
      }
    }
  };

  const getFilteredOwners = () => {
    if (!searchQuery) return owners;
    return owners.filter(owner =>
      owner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.phone?.includes(searchQuery) ||
      owner.national_id?.includes(searchQuery)
    );
  };

  const filteredOwners = getFilteredOwners();

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      national_id: '',
      address: '',
      city: 'القاهرة',
      country: 'مصر',
      owner_type: 'individual',
      company_name: '',
      tax_number: '',
      status: 'active',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>إدارة الملاك</h1>
        <PermissionGuard permission="ADD_OWNER">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'إلغاء' : '+ إضافة مالك جديد'}
          </button>
        </PermissionGuard>
      </div>

      {/* بحث */}
      <div style={{background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px'}}>
        <input
          type="text"
          placeholder="🔍 بحث عن مالك (الاسم، البريد، الهاتف، الرقم القومي)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem'}}
        />
      </div>

      {showForm && hasPermission('ADD_OWNER', currentUser?.role) && (
        <div className="form-container">
          <h2>{editingId ? 'تعديل مالك' : 'إضافة مالك جديد'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>الاسم *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>نوع المالك</label>
                <select value={formData.owner_type} onChange={(e) => setFormData({...formData, owner_type: e.target.value})}>
                  <option value="individual">فرد</option>
                  <option value="company">شركة</option>
                </select>
              </div>
            </div>

            {formData.owner_type === 'company' && (
              <div className="form-row">
                <div className="form-group">
                  <label>اسم الشركة</label>
                  <input type="text" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>الرقم الضريبي</label>
                  <input type="text" value={formData.tax_number} onChange={(e) => setFormData({...formData, tax_number: e.target.value})} />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>البريد الإلكتروني</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>رقم الهاتف *</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>رقم الهوية</label>
                <input type="text" value={formData.national_id} onChange={(e) => setFormData({...formData, national_id: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>العنوان</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>المدينة</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="form-group">
                <label>الدولة</label>
                <input type="text" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
              </div>
              <div className="form-group">
                <label>الحالة</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>ملاحظات</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="3"></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'تحديث' : 'إضافة'}</button>
              <button type="button" className="btn-secondary" onClick={resetForm}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم</th>
              <th>النوع</th>
              <th>الهاتف</th>
              <th>البريد الإلكتروني</th>
              <th>المدينة</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredOwners.map((owner) => (
              <tr key={owner.id}>
                <td>{owner.id}</td>
                <td>{owner.name}</td>
                <td>{owner.owner_type === 'individual' ? 'فرد' : 'شركة'}</td>
                <td>{owner.phone}</td>
                <td>{owner.email || '-'}</td>
                <td>{owner.city}</td>
                <td><span className={`badge ${owner.status}`}>{owner.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td>
                  <PermissionGuard permission="EDIT_OWNER">
                    <button className="btn-sm btn-edit" onClick={() => handleEdit(owner)}>تعديل</button>
                  </PermissionGuard>
                  <PermissionGuard permission="DELETE_OWNER">
                    <button className="btn-sm btn-delete" onClick={() => handleDelete(owner.id)}>حذف</button>
                  </PermissionGuard>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {filteredOwners.length === 0 && (
        <div className="empty-state">
          <p>{searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد ملاك مسجلين'}</p>
        </div>
      )}
    </div>
  );
}

export default Owners;
