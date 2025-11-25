import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import PermissionGuard from '../components/PermissionGuard';
import { hasPermission } from '../utils/permissions';
import { API_BASE_URL } from '../config/constants';
import './MonthlySubscriptions.css';

const API_URL = API_BASE_URL;

function MonthlySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculationData, setCalculationData] = useState({
    building: '',
    startMonth: new Date().toISOString().slice(0, 7),
    endMonth: new Date().toISOString().slice(0, 7)
  });
  const [calculationResult, setCalculationResult] = useState(null);
  const [filters, setFilters] = useState({
    building: 'all',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    status: 'all'
  });
  const [formData, setFormData] = useState({
    unit_id: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7),
    payment_date: '',
    status: 'pending',
    notes: ''
  });
  const { toasts, success, error, warning, info } = useToast();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userType = localStorage.getItem('userType');
      let buildingsRes;
      
      if (userType === 'building_user' && currentUser.role === 'admin') {
        // مدير النظام يشاهد جميع المباني
        buildingsRes = await axios.get(`${API_URL}/buildings`);
      } else if (userType === 'building_user' && currentUser.customer_id) {
        buildingsRes = await axios.get(`${API_URL}/buildings?customer_id=${currentUser.customer_id}`);
      } else {
        buildingsRes = await axios.get(`${API_URL}/buildings?customer_id=${currentUser.id}`);
      }
      
      const [unitsRes, subsRes] = await Promise.all([
        axios.get(`${API_URL}/units`),
        axios.get(`${API_URL}/monthly_subscriptions`)
      ]);

      const customerBuildings = buildingsRes.data;
      const buildingIds = customerBuildings.map(b => b.id);
      const customerUnits = unitsRes.data.filter(u => buildingIds.includes(u.building_id));
      const unitIds = customerUnits.map(u => u.id);
      const customerSubs = subsRes.data.filter(s => unitIds.includes(s.unit_id));

      setBuildings(customerBuildings);
      setUnits(customerUnits);
      setSubscriptions(customerSubs);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      error('❌ فشل في تحميل البيانات');
      setLoading(false);
    }
  };

  const getFilteredSubscriptions = () => {
    let filtered = [...subscriptions];

    if (filters.building !== 'all') {
      const buildingUnits = units.filter(u => u.building_id === parseInt(filters.building));
      const unitIds = buildingUnits.map(u => u.id);
      filtered = filtered.filter(s => unitIds.includes(s.unit_id));
    }

    if (filters.month !== 'all') {
      filtered = filtered.filter(s => s.month === filters.month);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    return filtered;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasPermission(currentUser.role, 'ADD_PAYMENT')) {
      error('❌ ليس لديك صلاحية لإضافة اشتراكات');
      return;
    }

    try {
      const subscriptionData = {
        ...formData,
        unit_id: parseInt(formData.unit_id),
        amount: parseFloat(formData.amount)
      };

      if (editingId) {
        await axios.put(`${API_URL}/monthly_subscriptions/${editingId}`, subscriptionData);
        success('✅ تم تحديث الاشتراك بنجاح');
      } else {
        await axios.post(`${API_URL}/monthly_subscriptions`, subscriptionData);
        success('✅ تم إضافة الاشتراك بنجاح');
      }

      loadData();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving subscription:', err);
      error('❌ فشل في حفظ الاشتراك');
    }
  };

  const handleEdit = (subscription) => {
    if (!hasPermission(currentUser.role, 'EDIT_PAYMENT')) {
      error('❌ ليس لديك صلاحية لتعديل الاشتراكات');
      return;
    }

    setEditingId(subscription.id);
    setFormData({
      unit_id: subscription.unit_id,
      amount: subscription.amount,
      month: subscription.month,
      payment_date: subscription.payment_date || '',
      status: subscription.status,
      notes: subscription.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!hasPermission(currentUser.role, 'DELETE_PAYMENT')) {
      error('❌ ليس لديك صلاحية لحذف الاشتراكات');
      return;
    }

    if (!window.confirm('هل أنت متأكد من حذف هذا الاشتراك؟')) return;

    try {
      await axios.delete(`${API_URL}/monthly_subscriptions/${id}`);
      success('✅ تم حذف الاشتراك بنجاح');
      loadData();
    } catch (err) {
      console.error('Error deleting subscription:', err);
      error('❌ فشل في حذف الاشتراك');
    }
  };

  const handleMarkAsPaid = async (subscription) => {
    if (!hasPermission(currentUser.role, 'EDIT_PAYMENT')) {
      error('❌ ليس لديك صلاحية لتحديث حالة الاشتراك');
      return;
    }

    try {
      await axios.put(`${API_URL}/monthly_subscriptions/${subscription.id}`, {
        ...subscription,
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0]
      });
      success('✅ تم تحديث حالة الاشتراك إلى مدفوع');
      loadData();
    } catch (err) {
      console.error('Error updating subscription:', err);
      error('❌ فشل في تحديث حالة الاشتراك');
    }
  };

  const handleGenerateMonthly = async () => {
    if (!hasPermission(currentUser.role, 'ADD_PAYMENT')) {
      error('❌ ليس لديك صلاحية لإنشاء اشتراكات');
      return;
    }

    const month = filters.month;
    const existingSubs = subscriptions.filter(s => s.month === month);
    
    if (existingSubs.length > 0) {
      if (!window.confirm(`توجد ${existingSubs.length} اشتراكات لهذا الشهر. هل تريد إضافة المتبقي؟`)) {
        return;
      }
    }

    try {
      const occupiedUnits = units.filter(u => u.status === 'occupied');
      const existingUnitIds = existingSubs.map(s => s.unit_id);
      const newUnits = occupiedUnits.filter(u => !existingUnitIds.includes(u.id));

      if (newUnits.length === 0) {
        info('ℹ️ جميع الوحدات لديها اشتراكات لهذا الشهر');
        return;
      }

      // إنشاء اشتراكات للوحدات الجديدة
      const promises = newUnits.map(unit => 
        axios.post(`${API_URL}/monthly_subscriptions`, {
          unit_id: unit.id,
          amount: unit.monthly_fee || 500, // قيمة افتراضية
          month: month,
          status: 'pending',
          payment_date: '',
          notes: 'تم إنشاؤه تلقائياً'
        })
      );

      await Promise.all(promises);
      success(`✅ تم إنشاء ${newUnits.length} اشتراك جديد للشهر ${month}`);
      loadData();
    } catch (err) {
      console.error('Error generating subscriptions:', err);
      error('❌ فشل في إنشاء الاشتراكات');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      unit_id: '',
      amount: '',
      month: new Date().toISOString().slice(0, 7),
      payment_date: '',
      status: 'pending',
      notes: ''
    });
  };

  const handleCalculateFees = () => {
    if (!calculationData.building) {
      warning('⚠️ يرجى اختيار العمارة');
      return;
    }

    const buildingUnits = units.filter(u => u.building_id === parseInt(calculationData.building));
    const start = new Date(calculationData.startMonth + '-01');
    const end = new Date(calculationData.endMonth + '-01');
    
    // حساب عدد الأشهر
    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth() + 1;
    if (months < 1) months = 1;

    const results = buildingUnits.map(unit => {
      const monthlyFee = parseFloat(unit.monthly_fee || 0);
      const totalDue = monthlyFee * months;

      // حساب المدفوع
      const paidSubs = subscriptions.filter(sub => {
        if (sub.unit_id !== unit.id || sub.status !== 'paid') return false;
        const subMonth = sub.month || '';
        return subMonth >= calculationData.startMonth && subMonth <= calculationData.endMonth;
      });
      
      const paidAmount = paidSubs.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
      const remaining = totalDue - paidAmount;

      return {
        unitId: unit.id,
        unitNumber: unit.unit_number,
        monthlyFee,
        months,
        totalDue,
        paidAmount,
        remaining,
        status: remaining > 0 ? (remaining === totalDue ? 'unpaid' : 'partial') : 'paid'
      };
    });

    setCalculationResult({
      building: buildings.find(b => b.id === parseInt(calculationData.building))?.name || '',
      startMonth: calculationData.startMonth,
      endMonth: calculationData.endMonth,
      months,
      results,
      totalDue: results.reduce((sum, r) => sum + r.totalDue, 0),
      totalPaid: results.reduce((sum, r) => sum + r.paidAmount, 0),
      totalRemaining: results.reduce((sum, r) => sum + r.remaining, 0)
    });

    success('✅ تم احتساب الرسوم بنجاح');
  };

  const getUnitInfo = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return 'غير معروف';
    const building = buildings.find(b => b.id === unit.building_id);
    return `${building?.name || ''} - وحدة ${unit.unit_number}`;
  };

  const getStats = () => {
    const filtered = getFilteredSubscriptions();
    const total = filtered.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    const paid = filtered.filter(s => s.status === 'paid').reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    const pending = filtered.filter(s => s.status === 'pending').reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    const overdue = filtered.filter(s => s.status === 'overdue').reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

    return { total, paid, pending, overdue, count: filtered.length };
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  const stats = getStats();
  const filteredSubscriptions = getFilteredSubscriptions();

  return (
    <div className="monthly-subscriptions">
      <Toast toasts={toasts} />
      
      <div className="page-header">
        <h1>🏠 اشتراكات الوحدات السكنية</h1>
        <p style={{color: '#6b7280', marginTop: '8px'}}>إدارة الاشتراكات الشهرية واحتساب الرسوم للوحدات</p>
      </div>

      {/* قسم احتساب الرسوم */}
      <div className="calculation-section" style={{background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
          <h2 style={{margin: 0, fontSize: '1.3rem'}}>📊 احتساب الرسوم</h2>
          <button 
            onClick={() => setShowCalculator(!showCalculator)} 
            className="btn btn-secondary"
            style={{fontSize: '0.9rem', padding: '8px 16px'}}
          >
            {showCalculator ? '❌ إخفاء' : '📊 عرض الحاسبة'}
          </button>
        </div>

        {showCalculator && (
          <div style={{background: 'white', padding: '20px', borderRadius: '8px'}}>
            <div style={{padding: '12px', background: '#eff6ff', borderRadius: '8px', marginBottom: '15px', borderRight: '4px solid #3b82f6'}}>
              <p style={{margin: 0, fontSize: '0.9rem', color: '#1e40af'}}>
                💡 <strong>احسب المستحقات:</strong> اختر عمارة والفترة الزمنية لمعرفة الرسوم المستحقة والمدفوعة والمتبقية لكل وحدة
              </p>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 600}}>🏢 العمارة</label>
                <select
                  value={calculationData.building}
                  onChange={(e) => setCalculationData({...calculationData, building: e.target.value})}
                  style={{width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '6px'}}
                >
                  <option value="">اختر العمارة</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 600}}>📅 من شهر</label>
                <input
                  type="month"
                  value={calculationData.startMonth}
                  onChange={(e) => setCalculationData({...calculationData, startMonth: e.target.value})}
                  style={{width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '6px'}}
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 600}}>📅 إلى شهر</label>
                <input
                  type="month"
                  value={calculationData.endMonth}
                  onChange={(e) => setCalculationData({...calculationData, endMonth: e.target.value})}
                  style={{width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '6px'}}
                />
              </div>

              <div style={{display: 'flex', alignItems: 'flex-end'}}>
                <button 
                  onClick={handleCalculateFees}
                  className="btn btn-primary"
                  style={{width: '100%', padding: '10px'}}
                >
                  🧮 احسب الرسوم
                </button>
              </div>
            </div>

            {calculationResult && (
              <div style={{marginTop: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px', border: '2px solid #3b82f6'}}>
                <h3 style={{marginTop: 0, color: '#1e40af'}}>📋 نتيجة الحساب: {calculationResult.building}</h3>
                <p style={{margin: '5px 0', color: '#6b7280'}}>
                  الفترة: من {calculationResult.startMonth} إلى {calculationResult.endMonth} ({calculationResult.months} شهر)
                </p>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', margin: '15px 0'}}>
                  <div style={{background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6'}}>
                      {calculationResult.totalDue.toLocaleString()}
                    </div>
                    <div style={{fontSize: '0.85rem', color: '#6b7280', marginTop: '5px'}}>💵 إجمالي المستحق</div>
                  </div>
                  <div style={{background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981'}}>
                      {calculationResult.totalPaid.toLocaleString()}
                    </div>
                    <div style={{fontSize: '0.85rem', color: '#6b7280', marginTop: '5px'}}>✅ المدفوع</div>
                  </div>
                  <div style={{background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444'}}>
                      {calculationResult.totalRemaining.toLocaleString()}
                    </div>
                    <div style={{fontSize: '0.85rem', color: '#6b7280', marginTop: '5px'}}>⏳ المتبقي</div>
                  </div>
                </div>

                <div style={{maxHeight: '300px', overflowY: 'auto', marginTop: '15px'}}>
                  <table style={{width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden'}}>
                    <thead>
                      <tr style={{background: '#f3f4f6'}}>
                        <th style={{padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb'}}>الوحدة</th>
                        <th style={{padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb'}}>الرسوم الشهرية</th>
                        <th style={{padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb'}}>عدد الأشهر</th>
                        <th style={{padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb'}}>المستحق</th>
                        <th style={{padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb'}}>المدفوع</th>
                        <th style={{padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb'}}>المتبقي</th>
                        <th style={{padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb'}}>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculationResult.results.map(result => (
                        <tr key={result.unitId} style={{borderBottom: '1px solid #e5e7eb'}}>
                          <td style={{padding: '12px'}}>{result.unitNumber}</td>
                          <td style={{padding: '12px', textAlign: 'center'}}>{result.monthlyFee.toLocaleString()}</td>
                          <td style={{padding: '12px', textAlign: 'center'}}>{result.months}</td>
                          <td style={{padding: '12px', textAlign: 'center', fontWeight: 600}}>{result.totalDue.toLocaleString()}</td>
                          <td style={{padding: '12px', textAlign: 'center', color: '#10b981'}}>{result.paidAmount.toLocaleString()}</td>
                          <td style={{padding: '12px', textAlign: 'center', color: '#ef4444'}}>{result.remaining.toLocaleString()}</td>
                          <td style={{padding: '12px', textAlign: 'center'}}>
                            {result.status === 'paid' ? '✅ مدفوع' : result.status === 'partial' ? '⚠️ جزئي' : '❌ غير مدفوع'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* القسم الأصلي للاشتراكات */}
      <div className="page-header" style={{marginTop: '20px'}}>
        <h2 style={{fontSize: '1.3rem'}}>📝 إدارة الاشتراكات</h2>
        <div className="header-actions">
          <PermissionGuard permission="ADD_PAYMENT">
            <button onClick={handleGenerateMonthly} className="btn btn-secondary">
              🔄 إنشاء اشتراكات الشهر
            </button>
          </PermissionGuard>
          <PermissionGuard permission="ADD_PAYMENT">
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              + إضافة اشتراك
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.count}</h3>
            <p>إجمالي الاشتراكات</p>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.paid.toLocaleString()} جنيه</h3>
            <p>المحصّل</p>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending.toLocaleString()} جنيه</h3>
            <p>المعلق</p>
          </div>
        </div>
        
        <div className="stat-card danger">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.overdue.toLocaleString()} جنيه</h3>
            <p>المتأخر</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>العمارة</label>
          <select value={filters.building} onChange={(e) => setFilters({...filters, building: e.target.value})}>
            <option value="all">جميع العمارات</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>الشهر</label>
          <input 
            type="month" 
            value={filters.month} 
            onChange={(e) => setFilters({...filters, month: e.target.value})}
          />
        </div>

        <div className="filter-group">
          <label>الحالة</label>
          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
            <option value="all">الكل</option>
            <option value="pending">معلق</option>
            <option value="paid">مدفوع</option>
            <option value="overdue">متأخر</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>الوحدة</th>
              <th>الشهر</th>
              <th>المبلغ</th>
              <th>تاريخ الدفع</th>
              <th>الحالة</th>
              <th>ملاحظات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '40px'}}>
                  لا توجد اشتراكات
                </td>
              </tr>
            ) : (
              filteredSubscriptions.map(sub => (
                <tr key={sub.id}>
                  <td>{getUnitInfo(sub.unit_id)}</td>
                  <td>{sub.month}</td>
                  <td className="amount">{parseFloat(sub.amount).toLocaleString()} جنيه</td>
                  <td>{sub.payment_date || '-'}</td>
                  <td>
                    <span className={`status-badge status-${sub.status}`}>
                      {sub.status === 'paid' ? 'مدفوع' : sub.status === 'pending' ? 'معلق' : 'متأخر'}
                    </span>
                  </td>
                  <td>{sub.notes || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      {sub.status !== 'paid' && (
                        <PermissionGuard permission="EDIT_PAYMENT">
                          <button 
                            onClick={() => handleMarkAsPaid(sub)} 
                            className="btn-icon btn-success"
                            title="تحديد كمدفوع"
                          >
                            ✅
                          </button>
                        </PermissionGuard>
                      )}
                      <PermissionGuard permission="EDIT_PAYMENT">
                        <button 
                          onClick={() => handleEdit(sub)} 
                          className="btn-icon btn-edit"
                          title="تعديل"
                        >
                          ✏️
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="DELETE_PAYMENT">
                        <button 
                          onClick={() => handleDelete(sub.id)} 
                          className="btn-icon btn-delete"
                          title="حذف"
                        >
                          🗑️
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'تعديل اشتراك' : 'إضافة اشتراك جديد'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>الوحدة *</label>
                <select 
                  value={formData.unit_id} 
                  onChange={(e) => setFormData({...formData, unit_id: e.target.value})}
                  required
                >
                  <option value="">اختر وحدة</option>
                  {units.map(unit => {
                    const building = buildings.find(b => b.id === unit.building_id);
                    return (
                      <option key={unit.id} value={unit.id}>
                        {building?.name} - وحدة {unit.unit_number}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>المبلغ *</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>الشهر *</label>
                  <input 
                    type="month" 
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>تاريخ الدفع</label>
                  <input 
                    type="date" 
                    value={formData.payment_date}
                    onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>الحالة *</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="pending">معلق</option>
                    <option value="paid">مدفوع</option>
                    <option value="overdue">متأخر</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>ملاحظات</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'حفظ التعديلات' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthlySubscriptions;
