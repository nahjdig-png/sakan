import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import PermissionGuard from '../components/PermissionGuard';
import { API_BASE_URL } from '../config/constants';
import './Cashbox.css';

const API_URL = API_BASE_URL;

function Cashbox() {
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7),
    building: 'all',
    type: 'all'
  });
  const { toasts, success, error } = useToast();
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
      
      const [unitsRes, subsRes, invoicesRes] = await Promise.all([
        axios.get(`${API_URL}/units`),
        axios.get(`${API_URL}/monthly_subscriptions`),
        axios.get(`${API_URL}/service_invoices`)
      ]);

      const customerBuildings = buildingsRes.data;
      const buildingIds = customerBuildings.map(b => b.id);
      const customerUnits = unitsRes.data.filter(u => buildingIds.includes(u.building_id));
      const unitIds = customerUnits.map(u => u.id);
      
      const customerSubs = subsRes.data.filter(s => unitIds.includes(s.unit_id));
      const customerInvoices = invoicesRes.data.filter(i => buildingIds.includes(i.building_id));

      setBuildings(customerBuildings);
      setUnits(customerUnits);
      setSubscriptions(customerSubs);
      setInvoices(customerInvoices);
      
      // دمج المعاملات (الاشتراكات والفواتير)
      const allTransactions = [
        ...customerSubs.map(s => ({
          ...s,
          type: 'subscription',
          date: s.payment_date || s.month,
          description: `اشتراك شهري - ${getUnitInfo(s.unit_id, customerUnits, customerBuildings)}`
        })),
        ...customerInvoices.map(i => ({
          ...i,
          type: 'invoice',
          date: i.payment_date || i.due_date,
          description: `فاتورة ${i.service_type} - ${getBuildingName(i.building_id, customerBuildings)}`
        }))
      ];

      // ترتيب حسب التاريخ
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(allTransactions);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      error('❌ فشل في تحميل البيانات');
      setLoading(false);
    }
  };

  const getUnitInfo = (unitId, unitsArray, buildingsArray) => {
    const unit = unitsArray.find(u => u.id === unitId);
    if (!unit) return 'غير معروف';
    const building = buildingsArray.find(b => b.id === unit.building_id);
    return `${building?.name || ''} - وحدة ${unit.unit_number}`;
  };

  const getBuildingName = (buildingId, buildingsArray) => {
    const building = buildingsArray.find(b => b.id === buildingId);
    return building?.name || 'غير معروف';
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // فلترة حسب الشهر
    if (filters.month !== 'all') {
      filtered = filtered.filter(t => t.date && t.date.startsWith(filters.month));
    }

    // فلترة حسب العمارة
    if (filters.building !== 'all') {
      filtered = filtered.filter(t => {
        if (t.type === 'subscription') {
          const unit = units.find(u => u.id === t.unit_id);
          return unit && unit.building_id === parseInt(filters.building);
        } else {
          return t.building_id === parseInt(filters.building);
        }
      });
    }

    // فلترة حسب النوع
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    return filtered;
  };

  const calculateStats = () => {
    const filtered = getFilteredTransactions();
    
    // إجمالي الاشتراكات المحصّلة
    const totalIncome = filtered
      .filter(t => t.type === 'subscription' && t.status === 'paid')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    // إجمالي الفواتير المدفوعة
    const totalExpenses = filtered
      .filter(t => t.type === 'invoice' && t.status === 'paid')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    // الرصيد المتبقي
    const balance = totalIncome - totalExpenses;
    
    // الاشتراكات المعلقة
    const pendingSubscriptions = filtered
      .filter(t => t.type === 'subscription' && (t.status === 'pending' || t.status === 'overdue'))
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    // الفواتير المعلقة
    const pendingInvoices = filtered
      .filter(t => t.type === 'invoice' && (t.status === 'pending' || t.status === 'overdue'))
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return {
      totalIncome,
      totalExpenses,
      balance,
      pendingSubscriptions,
      pendingInvoices
    };
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  const stats = calculateStats();
  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="cashbox">
      <Toast toasts={toasts} />
      
      <div className="page-header">
        <h1>💼 الصندوق</h1>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{stats.totalIncome.toLocaleString()} جنيه</h3>
            <p>إجمالي الاشتراكات المحصّلة</p>
          </div>
        </div>
        
        <div className="stat-card danger">
          <div className="stat-icon">📉</div>
          <div className="stat-content">
            <h3>{stats.totalExpenses.toLocaleString()} جنيه</h3>
            <p>إجمالي المصروفات (الفواتير)</p>
          </div>
        </div>
        
        <div className={`stat-card ${stats.balance >= 0 ? 'blue' : 'warning'}`}>
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{stats.balance.toLocaleString()} جنيه</h3>
            <p>الرصيد المتبقي</p>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingSubscriptions.toLocaleString()} جنيه</h3>
            <p>اشتراكات معلقة</p>
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="balance-summary">
        <div className="balance-card">
          <h2>ملخص الصندوق للشهر {filters.month}</h2>
          <div className="balance-details">
            <div className="balance-row">
              <span className="label">الاشتراكات المحصّلة (+)</span>
              <span className="value positive">+{stats.totalIncome.toLocaleString()} جنيه</span>
            </div>
            <div className="balance-row">
              <span className="label">المصروفات (الفواتير) (-)</span>
              <span className="value negative">-{stats.totalExpenses.toLocaleString()} جنيه</span>
            </div>
            <div className="balance-row total">
              <span className="label">الرصيد الحالي</span>
              <span className={`value ${stats.balance >= 0 ? 'positive' : 'negative'}`}>
                {stats.balance >= 0 ? '+' : ''}{stats.balance.toLocaleString()} جنيه
              </span>
            </div>
            <div className="balance-row">
              <span className="label">اشتراكات منتظرة</span>
              <span className="value pending">{stats.pendingSubscriptions.toLocaleString()} جنيه</span>
            </div>
            <div className="balance-row">
              <span className="label">فواتير منتظرة</span>
              <span className="value pending">{stats.pendingInvoices.toLocaleString()} جنيه</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>الشهر</label>
          <input 
            type="month" 
            value={filters.month} 
            onChange={(e) => setFilters({...filters, month: e.target.value})}
          />
        </div>

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
          <label>نوع المعاملة</label>
          <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
            <option value="all">الكل</option>
            <option value="subscription">اشتراكات (دخل)</option>
            <option value="invoice">فواتير (مصروفات)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-container">
        <h2>حركة الصندوق</h2>
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>النوع</th>
              <th>الوصف</th>
              <th>الحالة</th>
              <th>الوارد (+)</th>
              <th>المنصرف (-)</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '40px'}}>
                  لا توجد معاملات
                </td>
              </tr>
            ) : (
              filteredTransactions.map((trans, index) => (
                <tr key={`${trans.type}-${trans.id}-${index}`}>
                  <td>{trans.date || '-'}</td>
                  <td>
                    <span className={`type-badge type-${trans.type}`}>
                      {trans.type === 'subscription' ? '📥 اشتراك' : '📤 فاتورة'}
                    </span>
                  </td>
                  <td>{trans.description}</td>
                  <td>
                    <span className={`status-badge status-${trans.status}`}>
                      {trans.status === 'paid' ? 'مدفوع' : trans.status === 'pending' ? 'معلق' : 'متأخر'}
                    </span>
                  </td>
                  <td className="amount-income">
                    {trans.type === 'subscription' && trans.status === 'paid' 
                      ? `+${parseFloat(trans.amount).toLocaleString()} جنيه` 
                      : '-'}
                  </td>
                  <td className="amount-expense">
                    {trans.type === 'invoice' && trans.status === 'paid' 
                      ? `-${parseFloat(trans.amount).toLocaleString()} جنيه` 
                      : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Cashbox;
