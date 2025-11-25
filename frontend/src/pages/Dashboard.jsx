import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import './Dashboard.css';

const API_URL = API_BASE_URL;

function Dashboard() {
  const [stats, setStats] = useState({
    buildings: 0,
    units: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    occupancyRate: 0,
    owners: 0,
    serviceInvoices: 0,
    totalServices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    collectionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(userData);
    loadStats(userData);
  }, []);

  const loadStats = async (userData) => {
    try {
      const userType = localStorage.getItem('userType');
      let buildingsResponse;
      
      if (userType === 'building_user' && userData.role === 'admin') {
        // مدير النظام يشاهد جميع المباني
        buildingsResponse = await axios.get(`${API_URL}/buildings`);
      } else if (userType === 'building_user' && userData.customer_id) {
        buildingsResponse = await axios.get(`${API_URL}/buildings?customer_id=${userData.customer_id}`);
      } else {
        buildingsResponse = await axios.get(`${API_URL}/buildings?customer_id=${userData.id}`);
      }
      
      const buildings = buildingsResponse.data;
      const buildingIds = buildings.map(b => b.id);

      // جلب باقي البيانات المتعلقة بمباني العميل
      const [units, owners, serviceInvoices, monthlySubscriptions] = await Promise.all([
        axios.get(`${API_URL}/units`),
        axios.get(`${API_URL}/unit_owners`),
        axios.get(`${API_URL}/service_invoices`),
        axios.get(`${API_URL}/monthly_subscriptions`)
      ]);

      // تصفية البيانات حسب مباني العميل
      const customerUnits = units.data.filter(u => buildingIds.includes(u.building_id));
      const customerInvoices = serviceInvoices.data.filter(i => buildingIds.includes(i.building_id));
      const customerOwners = owners.data.filter(o => {
        // البحث عن الوحدات التي يملكها
        const ownerUnits = customerUnits.filter(u => u.owner_id === o.id || u.owner_email === o.email);
        return ownerUnits.length > 0;
      });

      const totalServices = customerInvoices.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
      const paidInvoices = customerInvoices.filter(i => i.status === 'paid').length;
      const pendingInvoices = customerInvoices.filter(i => i.status === 'pending').length;
      const overdueInvoicesCount = customerInvoices.filter(inv => {
        if (inv.status === 'pending' || inv.status === 'overdue') {
          const dueDate = new Date(inv.due_date);
          return new Date() > dueDate;
        }
        return false;
      }).length;

      // حساب الإشعارات
      const alerts = [];
      
      // تحقق من الاشتراك (فقط للعملاء العاديين)
      if (userType !== 'building_user') {
        const subscription = await axios.get(`${API_URL}/subscriptions?customer_id=${userData.id}`);
        if (subscription.data.length > 0) {
          const sub = subscription.data[0];
          const daysRemaining = Math.ceil((new Date(sub.end_date) - new Date()) / (1000 * 60 * 60 * 24));
        
          if (daysRemaining <= 0) {
            alerts.push({
              id: 'sub-expired',
              type: 'error',
              icon: '⚠️',
              title: 'انتهى اشتراكك!',
              message: 'يرجى تجديد الاشتراك للاستمرار في استخدام النظام',
              action: '/subscription'
            });
          } else if (daysRemaining <= 7) {
            alerts.push({
              id: 'sub-expiring',
              type: 'warning',
              icon: '⏰',
              title: 'اشتراكك على وشك الانتهاء',
              message: `باقي ${daysRemaining} يوم فقط`,
              action: '/subscription'
            });
          }
        }
      }

      // تحقق من الفواتير المتأخرة
      const overdueInvoices = customerInvoices.filter(inv => {
        if (inv.status === 'pending') {
          const dueDate = new Date(inv.due_date);
          return new Date() > dueDate;
        }
        return false;
      });

      if (overdueInvoices.length > 0) {
        alerts.push({
          id: 'invoices-overdue',
          type: 'error',
          icon: '💰',
          title: 'فواتير متأخرة',
          message: `لديك ${overdueInvoices.length} فاتورة متأخرة السداد`,
          action: '/invoices'
        });
      }

      setNotifications(alerts);

      // حساب معدلات إضافية
      const occupiedUnits = customerUnits.filter(u => u.status === 'occupied').length;
      const vacantUnits = customerUnits.filter(u => u.status === 'vacant').length;
      const occupancyRate = customerUnits.length > 0 ? ((occupiedUnits / customerUnits.length) * 100).toFixed(1) : 0;
      
      const paidAmount = customerInvoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
      const pendingAmount = customerInvoices
        .filter(i => i.status === 'pending')
        .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
      const overdueAmount = customerInvoices
        .filter(i => i.status === 'overdue')
        .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
      
      const collectionRate = totalServices > 0 ? ((paidAmount / totalServices) * 100).toFixed(1) : 0;

      setStats({
        buildings: buildings.length,
        units: customerUnits.length,
        occupiedUnits,
        vacantUnits,
        occupancyRate,
        owners: customerOwners.length,
        serviceInvoices: customerInvoices.length,
        totalServices,
        paidInvoices,
        pendingInvoices,
        paidAmount,
        pendingAmount,
        overdueAmount,
        collectionRate
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  const hasData = stats.buildings > 0 || stats.units > 0 || stats.owners > 0;

  return (
    <div className="dashboard">
      <h1>لوحة التحكم</h1>
      
      {/* الإشعارات */}
      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.map(notif => (
            <div key={notif.id} className={`notification notification-${notif.type}`}>
              <div className="notification-icon">{notif.icon}</div>
              <div className="notification-content">
                <h3>{notif.title}</h3>
                <p>{notif.message}</p>
              </div>
              {notif.action && (
                <Link to={notif.action} className="notification-action">
                  عرض التفاصيل
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {!hasData && (
        <div className="welcome-message">
          <h2>مرحباً بك في نظام إدارة العقارات! 👋</h2>
          <p>لم تقم بإضافة أي بيانات بعد. ابدأ بإضافة عمارة أو مالك وحدة.</p>
          <div className="welcome-actions">
            <Link to="/buildings" className="welcome-btn">+ إضافة عمارة</Link>
            <Link to="/owners" className="welcome-btn">+ إضافة مالك وحدة</Link>
          </div>
        </div>
      )}
      
      {/* الإحصائيات الرئيسية */}
      <div className="stats-grid">
        <Link to="/buildings" className="stat-card blue clickable">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>{stats.buildings}</h3>
            <p>العمارات</p>
          </div>
        </Link>

        <Link to="/units" className="stat-card green clickable">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <h3>{stats.units}</h3>
            <p>الوحدات السكنية</p>
            <div className="stat-progress">
              <div className="progress-bar">
                <div className="progress-fill success" style={{width: `${stats.occupancyRate}%`}}></div>
              </div>
              <div className="progress-label">معدل الإشغال: {stats.occupancyRate}%</div>
            </div>
          </div>
        </Link>

        <Link to="/units" className="stat-card purple clickable">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.owners}</h3>
            <p>ملاك الوحدات</p>
          </div>
        </Link>

        <Link to="/invoices" className="stat-card orange clickable">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{stats.serviceInvoices}</h3>
            <p>فواتير الخدمات</p>
          </div>
        </Link>
      </div>

      {/* الإحصائيات المالية */}
      <div className="financial-stats">
        <h2>💰 الإحصائيات المالية</h2>
        <div className="stats-grid">
          <Link to="/invoices" className="stat-card success clickable">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.paidAmount.toLocaleString()} جنيه</h3>
              <p>المدفوعات ({stats.paidInvoices} فاتورة)</p>
              <div className="stat-progress">
                <div className="progress-bar">
                  <div className="progress-fill success" style={{width: `${stats.collectionRate}%`}}></div>
                </div>
                <div className="progress-label">معدل التحصيل: {stats.collectionRate}%</div>
              </div>
            </div>
          </Link>

          <Link to="/invoices" className="stat-card warning clickable">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pendingAmount.toLocaleString()} جنيه</h3>
              <p>المعلقة ({stats.pendingInvoices} فاتورة)</p>
            </div>
          </Link>

          <Link to="/invoices" className="stat-card danger clickable">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{stats.overdueAmount.toLocaleString()} جنيه</h3>
              <p>المتأخرة</p>
            </div>
          </Link>

          <Link to="/cashbox" className="stat-card info clickable">
            <div className="stat-icon">💵</div>
            <div className="stat-content">
              <h3>{stats.totalServices.toLocaleString()} جنيه</h3>
              <p>إجمالي الخدمات</p>
            </div>
          </Link>
        </div>
      </div>

      {/* إحصائيات الوحدات */}
      <div className="units-stats">
        <h2>🏠 حالة الوحدات</h2>
        <div className="stats-grid">
          <Link to="/units" className="stat-card green clickable">
            <div className="stat-icon">✔️</div>
            <div className="stat-content">
              <h3>{stats.occupiedUnits}</h3>
              <p>وحدات مشغولة</p>
            </div>
          </Link>

          <Link to="/units" className="stat-card blue clickable">
            <div className="stat-icon">🔓</div>
            <div className="stat-content">
              <h3>{stats.vacantUnits}</h3>
              <p>وحدات شاغرة</p>
            </div>
          </Link>

          <Link to="/units" className="stat-card purple clickable">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.occupancyRate}%</h3>
              <p>معدل الإشغال</p>
            </div>
          </Link>

          <Link to="/units" className="stat-card orange clickable">
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <h3>{stats.units}</h3>
              <p>إجمالي الوحدات</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="quick-links">
        <h2>روابط سريعة</h2>
        <div className="links-grid">
          <Link to="/buildings" className="quick-link">
            <span className="link-icon">🏢</span>
            <span>إدارة العمارات</span>
          </Link>
          <Link to="/units" className="quick-link">
            <span className="link-icon">🏠</span>
            <span>إدارة الوحدات</span>
          </Link>
          <Link to="/owners" className="quick-link">
            <span className="link-icon">👥</span>
            <span>ملاك الوحدات</span>
          </Link>
          <Link to="/invoices" className="quick-link">
            <span className="link-icon">💰</span>
            <span>فواتير الخدمات</span>
          </Link>
          <Link to="/monthly-subscriptions" className="quick-link">
            <span className="link-icon">💵</span>
            <span>الاشتراكات الشهرية</span>
          </Link>
          <Link to="/cashbox" className="quick-link">
            <span className="link-icon">💼</span>
            <span>الصندوق</span>
          </Link>
          <Link to="/users" className="quick-link">
            <span className="link-icon">⭐</span>
            <span>اشتراكي</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
