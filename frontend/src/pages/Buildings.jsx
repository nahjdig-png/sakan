import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import PermissionGuard from '../components/PermissionGuard';
import { hasPermission } from '../utils/permissions';
import { API_BASE_URL } from '../config/constants';
import './BuildingsNew.css';

const API_URL = API_BASE_URL;

function Buildings() {
  const [buildingsWithStats, setBuildingsWithStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { toasts, removeToast, success, error } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'القاهرة',
    floors: 1,
    units_count: 0
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(userData);
    loadBuildings(userData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBuildings = async (userData) => {
    try {
      const userType = localStorage.getItem('userType');
      let response;
      
      if (userType === 'building_user' && userData.role === 'admin') {
        // مدير النظام يشاهد جميع المباني
        response = await axios.get(`${API_URL}/buildings`);
      } else if (userType === 'building_user' && userData.customer_id) {
        // موظف مرتبط بعميل معين
        response = await axios.get(`${API_URL}/buildings?customer_id=${userData.customer_id}`);
      } else {
        // عميل عادي يشاهد مبانيه فقط
        response = await axios.get(`${API_URL}/buildings?customer_id=${userData.id}`);
      }
      
      // تحميل إحصائيات العمارات
      await loadBuildingsWithStats(response.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading buildings:', error);
      setLoading(false);
    }
  };

  const loadBuildingsWithStats = async (buildingsList) => {
    try {
      // تحميل الوحدات والاشتراكات
      const unitsResponse = await axios.get(`${API_URL}/units`);
      const subscriptionsResponse = await axios.get(`${API_URL}/monthly_subscriptions`);
      
      const units = unitsResponse.data;
      const subscriptions = subscriptionsResponse.data;
      
      // حساب الإحصائيات لكل عمارة
      const buildingsStats = buildingsList.map(building => {
        const buildingUnits = units.filter(u => u.building_id === building.id);
        const buildingSubscriptions = subscriptions.filter(s => s.building_id === building.id);
        
        const occupiedUnits = buildingUnits.filter(u => u.status === 'occupied').length;
        const vacantUnits = buildingUnits.filter(u => u.status === 'vacant').length;
        const totalUnits = buildingUnits.length;
        
        // حساب إجمالي الاشتراكات
        const totalSubscriptions = buildingSubscriptions.reduce((sum, sub) => {
          return sum + (parseFloat(sub.amount) || 0);
        }, 0);
        
        // حساب الاشتراكات المدفوعة
        const paidSubscriptions = buildingSubscriptions
          .filter(s => s.status === 'paid')
          .reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0);
        
        // حساب الاشتراكات المعلقة
        const pendingSubscriptions = buildingSubscriptions
          .filter(s => s.status === 'pending')
          .reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0);
        
        return {
          ...building,
          totalUnits,
          occupiedUnits,
          vacantUnits,
          occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
          totalSubscriptions,
          paidSubscriptions,
          pendingSubscriptions
        };
      });
      
      setBuildingsWithStats(buildingsStats);
    } catch (error) {
      console.error('Error loading building stats:', error);
    }
  };

  const exportToExcel = () => {
    // إنشاء البيانات للتصدير
    const data = buildingsWithStats.map((building, index) => ({
      '#': index + 1,
      'اسم العمارة': building.name,
      'العنوان': building.address,
      'المدينة': building.city,
      'عدد الطوابق': building.floors,
      'إجمالي الوحدات': building.totalUnits,
      'الوحدات المشغولة': building.occupiedUnits,
      'الوحدات الشاغرة': building.vacantUnits,
      'نسبة الإشغال %': building.occupancyRate,
      'إجمالي الاشتراكات': building.totalSubscriptions.toFixed(2),
      'المدفوع': building.paidSubscriptions.toFixed(2),
      'المعلق': building.pendingSubscriptions.toFixed(2)
    }));
    
    // تحويل JSON إلى CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // إذا كانت القيمة تحتوي على فاصلة، ضعها بين علامات تنصيص
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    
    // إضافة BOM للدعم العربي
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `العمارات_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    success('تم تصدير البيانات إلى Excel بنجاح');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const buildingData = {
        ...formData,
        customer_id: currentUser.id
      };
      
      if (editingId) {
        await axios.put(`${API_URL}/buildings/${editingId}`, buildingData);
        success('✅ تم تحديث العمارة بنجاح');
      } else {
        await axios.post(`${API_URL}/buildings`, buildingData);
        success('✅ تم إضافة العمارة بنجاح');
      }
      resetForm();
      loadBuildings(currentUser);
    } catch (err) {
      console.error('Error saving building:', err);
      error('❌ فشل في حفظ البيانات');
    }
  };

  const handleEdit = (building) => {
    setFormData(building);
    setEditingId(building.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المبنى؟')) {
      try {
        await axios.delete(`${API_URL}/buildings/${id}`);
        success('✅ تم حذف العمارة بنجاح');
        loadBuildings(currentUser);
      } catch (err) {
        console.error('Error deleting building:', err);
        error('❌ فشل في حذف العمارة');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: 'القاهرة',
      floors: 1,
      units_count: 0
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="buildings-page">
      <div className="page-header">
        <h1>📋 إدارة المباني</h1>
        <div className="header-actions">
          {buildingsWithStats.length > 0 && (
            <button className="btn-export" onClick={exportToExcel}>
              📥 تصدير Excel
            </button>
          )}
          <PermissionGuard permission="ADD_BUILDING">
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ إلغاء' : '+ مبنى جديد'}
            </button>
          </PermissionGuard>
        </div>
      </div>

      {showForm && hasPermission('ADD_BUILDING', currentUser?.role) && (
        <div className="form-container">
          <h2>{editingId ? 'تعديل مبنى' : 'إضافة مبنى جديد'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>اسم المبنى *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>المدينة *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>العنوان *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>عدد الطوابق</label>
                <input
                  type="number"
                  value={formData.floors}
                  onChange={(e) => setFormData({...formData, floors: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>عدد الوحدات</label>
                <input
                  type="number"
                  value={formData.units_count}
                  onChange={(e) => setFormData({...formData, units_count: parseInt(e.target.value)})}
                  min="0"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'تحديث' : 'إضافة'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                إلغاء
              </button>
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
                <th className="col-name">اسم العمارة</th>
                <th className="col-address">العنوان</th>
                <th className="col-city">المدينة</th>
                <th className="col-number">طوابق</th>
                <th className="col-number">وحدات</th>
                <th className="col-number">مشغولة</th>
                <th className="col-number">شاغرة</th>
                <th className="col-percent">إشغال%</th>
                <th className="col-money">إجمالي</th>
                <th className="col-money">مدفوع</th>
                <th className="col-money">معلق</th>
                <th className="col-actions">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {buildingsWithStats.map((building, index) => (
                <tr key={building.id}>
                  <td>{index + 1}</td>
                  <td className="building-name">{building.name}</td>
                  <td>{building.address}</td>
                  <td>{building.city}</td>
                  <td>{building.floors}</td>
                  <td className="text-center">{building.totalUnits}</td>
                  <td className="text-center occupied">{building.occupiedUnits}</td>
                  <td className="text-center vacant">{building.vacantUnits}</td>
                  <td className="text-center">
                    <div className="occupancy-badge">
                      {building.occupancyRate}%
                    </div>
                  </td>
                  <td className="amount">{building.totalSubscriptions.toFixed(2)} ج.م</td>
                  <td className="amount paid">{building.paidSubscriptions.toFixed(2)} ج.م</td>
                  <td className="amount pending">{building.pendingSubscriptions.toFixed(2)} ج.م</td>
                  <td className="actions">
                    <PermissionGuard permission="EDIT_BUILDING">
                      <button 
                        className="btn-icon edit" 
                        onClick={() => handleEdit(building)}
                        title="تعديل"
                      >
                        ✏️
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission="DELETE_BUILDING">
                      <button 
                        className="btn-icon delete" 
                        onClick={() => handleDelete(building.id)}
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
          {buildingsWithStats.length === 0 && (
            <div className="empty-state">
              <p>لا توجد مباني حالياً</p>
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
    </div>
  );
}

export default Buildings;
