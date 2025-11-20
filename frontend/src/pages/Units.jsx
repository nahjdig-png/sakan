import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import PermissionGuard from '../components/PermissionGuard';
import { hasPermission } from '../utils/permissions';
import { API_BASE_URL } from '../config/constants';
import './BuildingsNew.css';

const API_URL = API_BASE_URL;

function Units() {
  const [units, setUnits] = useState([]);
  const [unitsWithStats, setUnitsWithStats] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { toasts, removeToast, success, error } = useToast();
  const [filters, setFilters] = useState({
    building: 'all',
    status: 'all',
    searchQuery: ''
  });
  const [formData, setFormData] = useState({
    building_id: '',
    unit_number: '',
    floor: 0,
    monthly_fee: 0,
    description: '',
    // بيانات المالك
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    owner_id_number: '',
    owner_notes: ''
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(userData);
    loadData(userData);
  }, []);

  const loadData = async (userData) => {
    try {
      const userType = localStorage.getItem('userType');
      let buildingsRes;
      
      if (userType === 'building_user' && userData.role === 'admin') {
        // مدير النظام يشاهد جميع المباني
        buildingsRes = await axios.get(`${API_URL}/buildings`);
      } else if (userType === 'building_user' && userData.customer_id) {
        // موظف مرتبط بعميل معين
        buildingsRes = await axios.get(`${API_URL}/buildings?customer_id=${userData.customer_id}`);
      } else {
        // عميل عادي
        buildingsRes = await axios.get(`${API_URL}/buildings?customer_id=${userData.id}`);
      }
      
      const buildingIds = buildingsRes.data.map(b => b.id);
      
      const unitsRes = await axios.get(`${API_URL}/units`);
      const filteredUnits = unitsRes.data.filter(unit => buildingIds.includes(unit.building_id));
      
      setUnits(filteredUnits);
      setBuildings(buildingsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      error('❌ فشل في تحميل البيانات');
      setLoading(false);
    }
  };

  const loadUnitsWithStats = async (unitsList) => {
    try {
      const subscriptionsRes = await axios.get(`${API_URL}/monthly_subscriptions`);
      const subscriptions = subscriptionsRes.data;
      
      const unitsStats = unitsList.map(unit => {
        const unitSubs = subscriptions.filter(s => s.unit_id === unit.id);
        
        const totalSubscriptions = unitSubs.reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0);
        const paidSubscriptions = unitSubs.filter(s => s.status === 'paid').reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0);
        const pendingSubscriptions = unitSubs.filter(s => s.status === 'pending').reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0);
        
        const building = buildings.find(b => b.id === unit.building_id);
        
        return {
          ...unit,
          building_name: building?.name || 'غير محدد',
          totalSubscriptions,
          paidSubscriptions,
          pendingSubscriptions
        };
      });
      
      setUnitsWithStats(unitsStats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const exportToExcel = () => {
    const data = unitsWithStats.map((unit, index) => ({
      '#': index + 1,
      'العمارة': unit.building_name,
      'رقم الوحدة': unit.unit_number,
      'الطابق': unit.floor,
      'المساحة': unit.area || '',
      'غرف النوم': unit.bedrooms || '',
      'الحمامات': unit.bathrooms || '',
      'الإيجار الشهري': unit.rent_amount || unit.monthly_fee || 0,
      'الحالة': unit.status === 'occupied' ? 'مشغولة' : unit.status === 'vacant' ? 'شاغرة' : 'صيانة',
      'المالك': unit.owner_name || '',
      'هاتف المالك': unit.owner_phone || '',
      'إجمالي الاشتراكات': unit.totalSubscriptions.toFixed(2),
      'المدفوع': unit.paidSubscriptions.toFixed(2),
      'المعلق': unit.pendingSubscriptions.toFixed(2)
    }));
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `الوحدات_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    success('✅ تم تصدير البيانات إلى Excel بنجاح');
  };

  useEffect(() => {
    if (units.length > 0 && buildings.length > 0) {
      loadUnitsWithStats(units);
    }
  }, [units, buildings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        floor: parseInt(formData.floor),
        area: parseFloat(formData.area),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        monthly_fee: parseFloat(formData.monthly_fee)
      };

      if (editingId) {
        await axios.put(`${API_URL}/units/${editingId}`, dataToSend);
        success('✅ تم تحديث الوحدة بنجاح');
      } else {
        await axios.post(`${API_URL}/units`, dataToSend);
        success('✅ تم إضافة الوحدة بنجاح');
      }
      resetForm();
      loadData(currentUser);
    } catch (err) {
      console.error('Error saving unit:', err);
      error('❌ فشل في حفظ البيانات');
    }
  };
  const handleEdit = (unit) => {
    setFormData(unit);
    setEditingId(unit.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الوحدة؟')) {
      try {
        await axios.delete(`${API_URL}/units/${id}`);
        success('✅ تم حذف الوحدة بنجاح');
        loadData(currentUser);
      } catch (err) {
        console.error('Error deleting unit:', err);
        error('❌ فشل في حذف الوحدة');
      }
    }
  };

  const getFilteredUnits = () => {
    let filtered = [...units];
    
    if (filters.building !== 'all') {
      filtered = filtered.filter(u => u.building_id === parseInt(filters.building));
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(u => u.status === filters.status);
    }
    
    if (filters.searchQuery) {
      filtered = filtered.filter(u =>
        u.unit_number?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredUnits = getFilteredUnits();

  const resetForm = () => {
    setFormData({
      building_id: '',
      unit_number: '',
      floor: 0,
      monthly_fee: 0,
      description: '',
      // بيانات المالك
      owner_name: '',
      owner_phone: '',
      owner_email: '',
      owner_id_number: '',
      owner_notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getBuildingName = (buildingId) => {
    const building = buildings.find(b => b.id === buildingId);
    return building ? building.name : `#${buildingId}`;
  };

  const getStatusText = (status) => {
    const statusMap = {
      occupied: 'مؤجرة',
      vacant: 'شاغرة',
      maintenance: 'صيانة'
    };
    return statusMap[status] || status;
  };

  const getTypeText = (type) => {
    const typeMap = {
      apartment: 'شقة',
      shop: 'محل',
      office: 'مكتب',
      studio: 'استوديو'
    };
    return typeMap[type] || type;
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="buildings-page">
      <div className="page-header">
        <h1>🏠 إدارة الوحدات</h1>
        <div className="header-actions">
          {unitsWithStats.length > 0 && (
            <button className="btn-export" onClick={exportToExcel}>
              📥 تصدير Excel
            </button>
          )}
          <PermissionGuard permission="ADD_UNIT">
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'إلغاء' : '+ وحدة جديدة'}
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* فلاتر البحث */}
      <div className="form-container" style={{marginBottom: 0, padding: '20px 30px'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
          <div>
            <label style={{fontWeight: 600, display: 'block', marginBottom: '8px', color: '#374151'}}>🔍 البحث</label>
            <input
              type="text"
              placeholder="رقم الوحدة..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
              style={{width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem'}}
            />
          </div>
          <div>
            <label style={{fontWeight: 600, display: 'block', marginBottom: '8px'}}>🏢 العمارة</label>
            <select
              value={filters.building}
              onChange={(e) => setFilters({...filters, building: e.target.value})}
              style={{width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px'}}
            >
              <option value="all">كل العمارات</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <div className="form-container" style={{background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px'}}>
          <h2>{editingId ? '✏️ تعديل وحدة' : '➕ إضافة وحدة جديدة'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>المبنى *</label>
                <select 
                  value={formData.building_id} 
                  onChange={(e) => setFormData({...formData, building_id: e.target.value})} 
                  required
                >
                  <option value="">اختر المبنى</option>
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>{building.name} - {building.address}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>رقم الوحدة *</label>
                <input type="text" value={formData.unit_number} onChange={(e) => setFormData({...formData, unit_number: e.target.value})} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>الطابق *</label>
                <input type="number" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>الرسوم الشهرية للوحدة *</label>
                <input 
                  type="number" 
                  value={formData.monthly_fee} 
                  onChange={(e) => setFormData({...formData, monthly_fee: e.target.value})} 
                  required 
                  placeholder="المبلغ الذي تدفعه الوحدة شهرياً لصندوق العمارة"
                />
              </div>
            </div>

            <div className="form-group">
              <small style={{ color: '#6b7280', fontSize: '0.85rem', display: 'block', marginBottom: '10px' }}>
                💡 الرسوم الشهرية تُستخدم لتغطية مصروفات العمارة (صيانة، راتب حارس، إلخ)
              </small>
            </div>

            <div className="form-group">
              <label>وصف الوحدة</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" placeholder="أدخل تفاصيل إضافية عن الوحدة..."></textarea>
            </div>

            {/* بيانات المالك */}
            <div style={{borderTop: '2px solid #e5e7eb', paddingTop: '20px', marginTop: '20px'}}>
              <h3 style={{marginBottom: '15px', color: '#374151', fontSize: '1.1rem'}}>
                👤 بيانات مالك الوحدة (اختياري)
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>اسم المالك</label>
                  <input 
                    type="text" 
                    value={formData.owner_name || ''} 
                    onChange={(e) => setFormData({...formData, owner_name: e.target.value})} 
                    placeholder="أدخل اسم المالك"
                  />
                </div>
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input 
                    type="tel" 
                    value={formData.owner_phone || ''} 
                    onChange={(e) => setFormData({...formData, owner_phone: e.target.value})} 
                    placeholder="01xxxxxxxxx"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    value={formData.owner_email || ''} 
                    onChange={(e) => setFormData({...formData, owner_email: e.target.value})} 
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>رقم الهوية / البطاقة</label>
                  <input 
                    type="text" 
                    value={formData.owner_id_number || ''} 
                    onChange={(e) => setFormData({...formData, owner_id_number: e.target.value})} 
                    placeholder="رقم البطاقة الشخصية"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>ملاحظات عن المالك</label>
                <textarea 
                  value={formData.owner_notes || ''} 
                  onChange={(e) => setFormData({...formData, owner_notes: e.target.value})} 
                  rows="2" 
                  placeholder="أي معلومات إضافية عن المالك..."
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'تحديث' : 'إضافة'}</button>
              <button type="button" className="btn-secondary" onClick={resetForm}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">⏳ جاري تحميل البيانات...</div>
      ) : (
        <div className="table-container">
          <table className="buildings-table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th className="col-name">العمارة</th>
                <th className="col-number">رقم الوحدة</th>
                <th className="col-number">الطابق</th>
                <th className="col-number">المساحة</th>
                <th className="col-number">غرف</th>
                <th className="col-number">حمامات</th>
                <th className="col-money">الإيجار</th>
                <th className="col-percent">الحالة</th>
                <th className="col-name">المالك</th>
                <th className="col-address">هاتف المالك</th>
                <th className="col-money">إجمالي</th>
                <th className="col-money">مدفوع</th>
                <th className="col-money">معلق</th>
                <th className="col-actions">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {unitsWithStats.filter(unit => {
                if (filters.building !== 'all' && unit.building_id !== filters.building) return false;
                if (filters.status !== 'all' && unit.status !== filters.status) return false;
                if (filters.searchQuery && !unit.unit_number.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
                return true;
              }).map((unit, index) => (
                <tr key={unit.id}>
                  <td>{index + 1}</td>
                  <td className="building-name">{unit.building_name}</td>
                  <td className="text-center"><strong>{unit.unit_number}</strong></td>
                  <td className="text-center">{unit.floor}</td>
                  <td className="text-center">{unit.area || '-'} م²</td>
                      <td className="text-center">{unit.bedrooms || '-'}</td>
                      <td className="text-center">{unit.bathrooms || '-'}</td>
                      <td className="amount">{(unit.rent_amount || unit.monthly_fee || 0).toLocaleString()} ج.م</td>
                      <td className="text-center">
                        <span className={`status-badge ${unit.status}`}>
                          {unit.status === 'occupied' ? '✅ مشغولة' : unit.status === 'vacant' ? '🔴 شاغرة' : '🔧 صيانة'}
                        </span>
                      </td>
                      <td>{unit.owner_name || '-'}</td>
                      <td>{unit.owner_phone || '-'}</td>
                      <td className="amount">{unit.totalSubscriptions.toFixed(2)} ج.م</td>
                      <td className="amount paid">{unit.paidSubscriptions.toFixed(2)} ج.م</td>
                      <td className="amount pending">{unit.pendingSubscriptions.toFixed(2)} ج.م</td>
                      <td className="actions">
                        <PermissionGuard permission="EDIT_UNIT">
                          <button 
                            className="btn-icon edit" 
                            onClick={() => handleEdit(unit)}
                            title="تعديل"
                          >
                            ✏️
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="DELETE_UNIT">
                          <button 
                            className="btn-icon delete" 
                            onClick={() => handleDelete(unit.id)}
                            title="حذف"
                          >
                            🗑️
                          </button>
                        </PermissionGuard>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {unitsWithStats.length === 0 && (
                <div className="empty-state">
                  <p>لا توجد وحدات حالياً</p>
                </div>
              )}
            </div>
      )}

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

      {filteredUnits.length === 0 && (
        <div className="empty-state">
          <p>{filters.building !== 'all' || filters.status !== 'all' || filters.searchQuery ? 'لا توجد نتائج' : 'لا يوجد وحدات مسجلة'}</p>
        </div>
      )}
    </div>
  );
}

export default Units;
