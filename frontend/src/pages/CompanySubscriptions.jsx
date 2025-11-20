import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import './BuildingsNew.css';

const API_URL = API_BASE_URL;

function CompanySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    expiringSoon: 0,
    overdueSubscriptions: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    plan: 'all',
    searchQuery: ''
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // تحميل البيانات
      const [subsResponse, customersResponse, buildingsResponse] = await Promise.all([
        axios.get(`${API_URL}/subscriptions`),
        axios.get(`${API_URL}/customers`),
        axios.get(`${API_URL}/buildings`)
      ]);

      const subsData = subsResponse.data;
      const customersData = customersResponse.data;
      const buildingsData = buildingsResponse.data;

      setSubscriptions(subsData);
      setCustomers(customersData);
      setBuildings(buildingsData);

      // حساب الإحصائيات
      calculateStats(subsData, customersData, buildingsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const calculateStats = (subs, custs, blds) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // إجمالي الإيرادات من الاشتراكات النشطة
    const totalRevenue = subs
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);

    // عدد الاشتراكات النشطة
    const activeSubscriptions = subs.filter(s => s.status === 'active').length;

    // الاشتراكات المنتهية قريباً (خلال 30 يوم)
    const expiringSoon = subs.filter(s => {
      if (s.status !== 'active') return false;
      const endDate = new Date(s.end_date);
      return endDate >= now && endDate <= thirtyDaysFromNow;
    }).length;

    // الاشتراكات المتأخرة (انتهت ولم تجدد)
    const overdueSubscriptions = subs.filter(s => {
      const endDate = new Date(s.end_date);
      return endDate < now && s.status === 'expired';
    }).length;

    // الإيرادات الشهرية (آخر 30 يوم)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthlyRevenue = subs
      .filter(s => {
        if (!s.paid_at) return false;
        const paidDate = new Date(s.paid_at);
        return paidDate >= thirtyDaysAgo && paidDate <= now;
      })
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);

    // الإيرادات السنوية (آخر 365 يوم)
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const yearlyRevenue = subs
      .filter(s => {
        if (!s.paid_at) return false;
        const paidDate = new Date(s.paid_at);
        return paidDate >= yearAgo && paidDate <= now;
      })
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);

    setStats({
      totalRevenue,
      activeSubscriptions,
      expiringSoon,
      overdueSubscriptions,
      monthlyRevenue,
      yearlyRevenue
    });
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'غير معروف';
  };

  const getCustomerEmail = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.email : '-';
  };

  const getCustomerBuildings = (customerId) => {
    return buildings.filter(b => b.customer_id === customerId).length;
  };

  const getPlanLabel = (plan) => {
    const plans = {
      'basic': 'أساسية',
      'standard': 'قياسية',
      'premium': 'متقدمة',
      'enterprise': 'مؤسسات'
    };
    return plans[plan] || plan;
  };

  const getStatusBadge = (subscription) => {
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (subscription.status === 'active') {
      if (daysLeft <= 7) {
        return <span className="status-badge" style={{background: '#fef3c7', color: '#92400e', border: '1px solid #fbbf24'}}>⚠️ ينتهي خلال {daysLeft} يوم</span>;
      } else if (daysLeft <= 30) {
        return <span className="status-badge" style={{background: '#dbeafe', color: '#1e40af', border: '1px solid #3b82f6'}}>📅 ينتهي خلال {daysLeft} يوم</span>;
      }
      return <span className="status-badge" style={{background: '#d1fae5', color: '#065f46', border: '1px solid #10b981'}}>✅ نشط</span>;
    } else if (subscription.status === 'expired') {
      return <span className="status-badge" style={{background: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444'}}>❌ منتهي</span>;
    } else if (subscription.status === 'cancelled') {
      return <span className="status-badge" style={{background: '#f3f4f6', color: '#374151', border: '1px solid #9ca3af'}}>🚫 ملغي</span>;
    }
    return <span className="status-badge">{subscription.status}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const exportToExcel = () => {
    const data = filteredSubscriptions.map((sub, index) => ({
      '#': index + 1,
      'العميل': getCustomerName(sub.customer_id),
      'البريد الإلكتروني': getCustomerEmail(sub.customer_id),
      'الباقة': getPlanLabel(sub.plan),
      'القيمة': sub.amount + ' ج.م',
      'تاريخ البداية': formatDate(sub.start_date),
      'تاريخ الانتهاء': formatDate(sub.end_date),
      'الحالة': sub.status,
      'تاريخ الدفع': formatDate(sub.paid_at),
      'طريقة الدفع': sub.payment_method || '-',
      'التجديد التلقائي': sub.auto_renew ? 'نعم' : 'لا'
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
    link.setAttribute('download', `اشتراكات_الشركة_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filters.status !== 'all' && sub.status !== filters.status) return false;
    if (filters.plan !== 'all' && sub.plan !== filters.plan) return false;
    if (filters.searchQuery) {
      const customerName = getCustomerName(sub.customer_id).toLowerCase();
      const customerEmail = getCustomerEmail(sub.customer_id).toLowerCase();
      const query = filters.searchQuery.toLowerCase();
      if (!customerName.includes(query) && !customerEmail.includes(query)) return false;
    }
    return true;
  });

  if (loading) {
    return <div className="loading">⏳ جاري تحميل البيانات...</div>;
  }

  return (
    <div className="buildings-page">
      {/* Header */}
      <div className="page-header">
        <h1>💰 تقارير اشتراكات الشركة</h1>
        <div className="header-actions">
          {subscriptions.length > 0 && (
            <button className="btn-export" onClick={exportToExcel}>
              📥 تصدير Excel
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        padding: '20px 30px',
        background: '#f5f7fa'
      }}>
        {/* إجمالي الإيرادات */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px'}}>💎 إجمالي الإيرادات</div>
          <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.totalRevenue.toLocaleString()} ج.م</div>
          <div style={{fontSize: '0.85rem', opacity: 0.8, marginTop: '8px'}}>من {stats.activeSubscriptions} اشتراك نشط</div>
        </div>

        {/* الإيرادات الشهرية */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px'}}>📅 إيرادات آخر 30 يوم</div>
          <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.monthlyRevenue.toLocaleString()} ج.م</div>
          <div style={{fontSize: '0.85rem', opacity: 0.8, marginTop: '8px'}}>متوسط: {Math.round(stats.monthlyRevenue / 30).toLocaleString()} ج.م/يوم</div>
        </div>

        {/* الاشتراكات المنتهية قريباً */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
        }}>
          <div style={{fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px'}}>⏰ تنتهي خلال 30 يوم</div>
          <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.expiringSoon}</div>
          <div style={{fontSize: '0.85rem', opacity: 0.8, marginTop: '8px'}}>تحتاج متابعة للتجديد</div>
        </div>

        {/* الإيرادات السنوية */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
        }}>
          <div style={{fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px'}}>📊 إيرادات آخر 365 يوم</div>
          <div style={{fontSize: '2rem', fontWeight: 'bold'}}>{stats.yearlyRevenue.toLocaleString()} ج.م</div>
          <div style={{fontSize: '0.85rem', opacity: 0.8, marginTop: '8px'}}>متوسط: {Math.round(stats.yearlyRevenue / 12).toLocaleString()} ج.م/شهر</div>
        </div>
      </div>

      {/* Filters */}
      <div className="form-container" style={{marginBottom: 0, padding: '20px 30px'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
          <div>
            <label style={{fontWeight: 600, display: 'block', marginBottom: '8px', color: '#374151'}}>🔍 البحث</label>
            <input
              type="text"
              placeholder="اسم العميل أو البريد..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
              style={{width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem'}}
            />
          </div>

          <div>
            <label style={{fontWeight: 600, display: 'block', marginBottom: '8px', color: '#374151'}}>📦 الباقة</label>
            <select
              value={filters.plan}
              onChange={(e) => setFilters({...filters, plan: e.target.value})}
              style={{width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem'}}
            >
              <option value="all">الكل</option>
              <option value="basic">أساسية</option>
              <option value="standard">قياسية</option>
              <option value="premium">متقدمة</option>
              <option value="enterprise">مؤسسات</option>
            </select>
          </div>

          <div>
            <label style={{fontWeight: 600, display: 'block', marginBottom: '8px', color: '#374151'}}>📊 الحالة</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              style={{width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem'}}
            >
              <option value="all">الكل</option>
              <option value="active">نشط</option>
              <option value="expired">منتهي</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="buildings-table">
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th className="col-name">العميل</th>
              <th className="col-address">البريد</th>
              <th className="col-number">عمارات</th>
              <th className="col-percent">الباقة</th>
              <th className="col-money">القيمة</th>
              <th className="col-address">تاريخ البداية</th>
              <th className="col-address">تاريخ الانتهاء</th>
              <th className="col-percent">الحالة</th>
              <th className="col-address">آخر دفعة</th>
              <th className="col-percent">تجديد تلقائي</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((subscription, index) => (
              <tr key={subscription.id}>
                <td>{index + 1}</td>
                <td className="building-name">{getCustomerName(subscription.customer_id)}</td>
                <td style={{fontSize: '0.85rem', color: '#6b7280'}}>{getCustomerEmail(subscription.customer_id)}</td>
                <td className="text-center">
                  <span style={{
                    background: '#dbeafe',
                    color: '#1e40af',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}>
                    🏢 {getCustomerBuildings(subscription.customer_id)}
                  </span>
                </td>
                <td className="text-center">
                  <span style={{
                    background: subscription.plan === 'premium' ? '#f3e8ff' : 
                              subscription.plan === 'enterprise' ? '#fef3c7' : '#e0f2fe',
                    color: subscription.plan === 'premium' ? '#6b21a8' : 
                           subscription.plan === 'enterprise' ? '#92400e' : '#075985',
                    padding: '5px 12px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}>
                    {getPlanLabel(subscription.plan)}
                  </span>
                </td>
                <td className="amount" style={{fontWeight: 700, color: '#10b981'}}>
                  {subscription.amount.toLocaleString()} ج.م
                </td>
                <td style={{fontSize: '0.85rem'}}>{formatDate(subscription.start_date)}</td>
                <td style={{fontSize: '0.85rem'}}>{formatDate(subscription.end_date)}</td>
                <td className="text-center">{getStatusBadge(subscription)}</td>
                <td style={{fontSize: '0.85rem', color: '#6b7280'}}>
                  {subscription.paid_at ? formatDate(subscription.paid_at) : '-'}
                </td>
                <td className="text-center">
                  {subscription.auto_renew ? 
                    <span style={{color: '#10b981', fontWeight: 600}}>✅</span> : 
                    <span style={{color: '#9ca3af'}}>➖</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSubscriptions.length === 0 && (
          <div className="empty-state">
            <p>لا توجد اشتراكات</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanySubscriptions;
