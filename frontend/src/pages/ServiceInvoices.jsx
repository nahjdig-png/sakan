import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import PermissionGuard from '../components/PermissionGuard';
import { hasPermission } from '../utils/permissions';
import { API_BASE_URL } from '../config/constants';
import './ServiceInvoices.css';

const API_URL = API_BASE_URL;

function ServiceInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    serviceType: 'all',
    building: 'all',
    month: 'all',
    searchQuery: ''
  });
  const [formData, setFormData] = useState({
    building_id: '',
    service_type_id: '',
    amount: '',
    billing_period: '',
    status: 'pending',
    notes: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchInvoices();
    fetchServiceTypes();
    fetchBuildings();
  }, []);

  useEffect(() => {
    // تطبيق الفلاتر
    applyFilters();
  }, [invoices, filters]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API_URL}/service_invoices`);
      const userData = JSON.parse(localStorage.getItem('user'));
      const userType = localStorage.getItem('userType');
      
      let filteredInvoices;
      
      if (userType === 'building_user' && userData.role === 'admin') {
        // مدير النظام يشاهد جميع الفواتير
        filteredInvoices = response.data;
      } else {
        // تصفية الفواتير حسب المباني التابعة للعميل
        let buildingsResponse;
        if (userType === 'building_user' && userData.customer_id) {
          buildingsResponse = await axios.get(`${API_URL}/buildings?customer_id=${userData.customer_id}`);
        } else {
          buildingsResponse = await axios.get(`${API_URL}/buildings?customer_id=${userData.id}`);
        }
        const customerBuildingIds = buildingsResponse.data.map(b => b.id);
        
        filteredInvoices = response.data.filter(invoice => 
          customerBuildingIds.includes(invoice.building_id)
        );
      }
      
      setInvoices(filteredInvoices);
      setFilteredInvoices(filteredInvoices);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      error('فشل في تحميل الفواتير');
      setLoading(false);
    }
  };

  const fetchServiceTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/service_types`);
      setServiceTypes(response.data);
    } catch (err) {
      console.error('Error fetching service types:', err);
    }
  };

  const fetchBuildings = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userType = localStorage.getItem('userType');
      
      let response;
      if (userType === 'building_user' && userData.role === 'admin') {
        // مدير النظام يشاهد جميع المباني
        response = await axios.get(`${API_URL}/buildings`);
      } else if (userType === 'building_user' && userData.customer_id) {
        response = await axios.get(`${API_URL}/buildings?customer_id=${userData.customer_id}`);
      } else {
        response = await axios.get(`${API_URL}/buildings?customer_id=${userData.id}`);
      }
      
      setBuildings(response.data);
    } catch (err) {
      console.error('Error fetching buildings:', err);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000);
    return `INV-${year}${month}-${random}`;
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // فلتر حسب الحالة
    if (filters.status !== 'all') {
      filtered = filtered.filter(inv => inv.status === filters.status);
    }

    // فلتر حسب نوع الخدمة
    if (filters.serviceType !== 'all') {
      filtered = filtered.filter(inv => inv.service_type_id === parseInt(filters.serviceType));
    }

    // فلتر حسب العمارة
    if (filters.building !== 'all') {
      filtered = filtered.filter(inv => inv.building_id === parseInt(filters.building));
    }

    // فلتر حسب الشهر
    if (filters.month !== 'all') {
      filtered = filtered.filter(inv => {
        const invDate = new Date(inv.billing_period);
        const invMonth = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
        return invMonth === filters.month;
      });
    }

    // فلتر البحث النصي
    if (filters.searchQuery) {
      filtered = filtered.filter(inv =>
        inv.invoice_number?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        getBuildingName(inv.building_id)?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    setFilteredInvoices(filtered);
  };

  const getStats = () => {
    const total = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const paid = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const pending = filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

    return { total, paid, pending, count: filteredInvoices.length };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceNumber = editingInvoice ? editingInvoice.invoice_number : generateInvoiceNumber();
      const issueDate = editingInvoice ? editingInvoice.issue_date : new Date().toISOString();

      const invoiceData = {
        ...formData,
        customer_id: currentUser.id,
        invoice_number: invoiceNumber,
        issue_date: issueDate,
        amount: parseFloat(formData.amount),
        status: formData.status
      };

      if (editingInvoice) {
        await axios.put(`${API_URL}/service_invoices/${editingInvoice.id}`, invoiceData);
        success('✅ تم تحديث الفاتورة بنجاح');
      } else {
        await axios.post(`${API_URL}/service_invoices`, invoiceData);
        success('✅ تم إضافة الفاتورة بنجاح');
      }
      
      fetchInvoices();
      resetForm();
    } catch (err) {
      console.error('Error saving invoice:', err);
      error('❌ فشل في حفظ الفاتورة');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      try {
        await axios.delete(`${API_URL}/service_invoices/${id}`);
        fetchInvoices();
        success('✅ تم حذف الفاتورة بنجاح');
      } catch (err) {
        console.error('Error deleting invoice:', err);
        error('❌ فشل في حذف الفاتورة');
      }
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      building_id: invoice.building_id,
      service_type_id: invoice.service_type_id,
      amount: invoice.amount,
      billing_period: invoice.billing_period,
      status: invoice.status,
      notes: invoice.notes || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      building_id: '',
      service_type_id: '',
      amount: '',
      billing_period: '',
      status: 'pending',
      notes: ''
    });
    setEditingInvoice(null);
    setShowForm(false);
  };

  const getServiceTypeName = (id) => {
    const service = serviceTypes.find(s => s.id === id);
    return service ? service.name : 'غير محدد';
  };

  const getServiceTypeIcon = (id) => {
    const service = serviceTypes.find(s => s.id === id);
    return service ? service.icon : '📄';
  };

  const getBuildingName = (id) => {
    const building = buildings.find(b => b.id === id);
    return building ? building.name : 'غير محدد';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'قيد الانتظار', class: 'status-pending' },
      paid: { label: 'مدفوعة', class: 'status-paid' },
      overdue: { label: 'متأخرة', class: 'status-overdue' },
      cancelled: { label: 'ملغاة', class: 'status-cancelled' }
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
  const paidAmount = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
  const pendingAmount = filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
  const stats = getStats();

  if (loading) {
    return (
      <div className="service-invoices">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري تحميل الفواتير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="service-invoices">
      <div className="page-header">
        <h1>💰 فواتير الخدمات</h1>
        <PermissionGuard permission="ADD_INVOICE">
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? '✖️ إلغاء' : '➕ فاتورة جديدة'}
          </button>
        </PermissionGuard>
      </div>

      {/* قسم الفلاتر */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>🔍 البحث</label>
            <input
              type="text"
              placeholder="رقم الفاتورة، العمارة..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>📊 الحالة</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="filter-select"
            >
              <option value="all">الكل</option>
              <option value="pending">قيد الانتظار</option>
              <option value="paid">مدفوعة</option>
            </select>
          </div>

          <div className="filter-group">
            <label>🏢 العمارة</label>
            <select
              value={filters.building}
              onChange={(e) => setFilters({ ...filters, building: e.target.value })}
              className="filter-select"
            >
              <option value="all">كل العمارات</option>
              {buildings.map(building => (
                <option key={building.id} value={building.id}>{building.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>🔧 نوع الخدمة</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
              className="filter-select"
            >
              <option value="all">كل الخدمات</option>
              {serviceTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>📅 الشهر</label>
            <input
              type="month"
              value={filters.month === 'all' ? '' : filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value || 'all' })}
              className="filter-input"
            />
          </div>
        </div>
      </div>

      {/* إحصائيات محسّنة */}
      <div className="stats-summary">
        <div className="stat-card total">
          <div className="stat-icon">💵</div>
          <div className="stat-info">
            <h3>إجمالي الفواتير</h3>
            <p className="stat-value">{stats.total.toFixed(2)} جنيه</p>
            <span className="stat-count">{stats.count} فاتورة</span>
          </div>
        </div>
        <div className="stat-card paid">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>المدفوعات</h3>
            <p className="stat-value">{stats.paid.toFixed(2)} جنيه</p>
            <span className="stat-percentage">{stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(1) : 0}%</span>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>قيد الانتظار</h3>
            <p className="stat-value">{stats.pending.toFixed(2)} جنيه</p>
          </div>
        </div>
      </div>

      {showForm && hasPermission('ADD_INVOICE', currentUser?.role) && (
        <div className="form-card">
          <h2>{editingInvoice ? '✏️ تعديل فاتورة' : '➕ فاتورة خدمة جديدة'}</h2>
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
                    <option key={building.id} value={building.id}>{building.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>نوع الخدمة *</label>
                <select
                  value={formData.service_type_id}
                  onChange={(e) => setFormData({...formData, service_type_id: e.target.value})}
                  required
                >
                  <option value="">اختر نوع الخدمة</option>
                  {serviceTypes.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.icon} {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>المبلغ (جنيه) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>تاريخ الفاتورة *</label>
                <input
                  type="date"
                  value={formData.billing_period}
                  onChange={(e) => setFormData({...formData, billing_period: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>الحالة</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="paid">مدفوعة</option>
                </select>
              </div>

              <div className="form-group">
                <label>ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="1"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-success">
                {editingInvoice ? '💾 حفظ التعديلات' : '➕ إضافة فاتورة'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                ✖️ إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="invoices-grid">
        {filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>لا توجد فواتير</h3>
            <p>{filters.status !== 'all' || filters.searchQuery ? 'لا توجد نتائج للبحث' : 'ابدأ بإضافة فواتير الخدمات الخاصة بعماراتك'}</p>
          </div>
        ) : (
          filteredInvoices.map(invoice => (
            <div key={invoice.id} className="invoice-card">
              <div className="invoice-header">
                <div className="service-type">
                  <span className="service-icon">{getServiceTypeIcon(invoice.service_type_id)}</span>
                  <h3>{getServiceTypeName(invoice.service_type_id)}</h3>
                </div>
                {getStatusBadge(invoice.status)}
              </div>

              <div className="invoice-details">
                <div className="detail-row">
                  <span className="label">🏢 المبنى:</span>
                  <span className="value">{getBuildingName(invoice.building_id)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">📅 تاريخ الفاتورة:</span>
                  <span className="value">{new Date(invoice.billing_period).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="detail-row amount">
                  <span className="label">💵 المبلغ:</span>
                  <span className="value">{parseFloat(invoice.amount).toFixed(2)} جنيه</span>
                </div>
                {invoice.notes && (
                  <div className="detail-row">
                    <span className="label">📝 ملاحظات:</span>
                    <span className="value">{invoice.notes}</span>
                  </div>
                )}
              </div>

              <div className="invoice-actions">
                <PermissionGuard permission="EDIT_INVOICE">
                  <button onClick={() => handleEdit(invoice)} className="btn-edit">
                    ✏️ تعديل
                  </button>
                </PermissionGuard>
                <PermissionGuard permission="DELETE_INVOICE">
                  <button onClick={() => handleDelete(invoice.id)} className="btn-delete">
                    🗑️ حذف
                  </button>
                </PermissionGuard>
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

export default ServiceInvoices;
