import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { API_BASE_URL } from '../config/constants';
import './MySubscription.css';

const API_URL = API_BASE_URL;

function MySubscription() {
  const [customer, setCustomer] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { toasts, success, error, warning, removeToast } = useToast();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // خطط الاشتراك
  const PLANS = [
    {
      id: 'basic',
      name: 'الباقة الأساسية',
      price: 200,
      minUnits: 0,
      maxUnits: 50,
      color: '#3b82f6',
      icon: '🏠',
      features: [
        'عمارة واحدة فقط',
        'حتى 50 شقة',
        'إدارة الوحدات والملاك',
        'إدارة الفواتير',
        'نظام الصيانة',
        'دعم فني أساسي'
      ]
    },
    {
      id: 'premium',
      name: 'الباقة المميزة',
      price: 400,
      minUnits: 0,
      maxUnits: 200,
      color: '#f59e0b',
      icon: '🏢',
      features: [
        'عمارة واحدة فقط',
        'حتى 200 شقة',
        'جميع مميزات الباقة الأساسية',
        'الاشتراكات الشهرية',
        'نظام الصندوق',
        'تقارير مفصلة',
        'دعم فني متقدم'
      ]
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userType = localStorage.getItem('userType');
      const customerId = userType === 'customer' ? currentUser.id : currentUser.customer_id;

      const [customerRes, buildingsRes, unitsRes, subsRes] = await Promise.all([
        axios.get(`${API_URL}/customers/${customerId}`),
        axios.get(`${API_URL}/buildings?customer_id=${customerId}`),
        axios.get(`${API_URL}/units`),
        axios.get(`${API_URL}/subscriptions?customer_id=${customerId}`)
      ]);

      setCustomer(customerRes.data);
      setBuildings(buildingsRes.data);
      
      // تصفية الوحدات لعمارات العميل فقط
      const buildingIds = buildingsRes.data.map(b => b.id);
      const customerUnits = unitsRes.data.filter(u => buildingIds.includes(u.building_id));
      setUnits(customerUnits);

      // الحصول على الاشتراك النشط
      const activeSub = subsRes.data.find(s => s.status === 'active');
      setSubscription(activeSub);

      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      error('❌ فشل في تحميل البيانات');
      setLoading(false);
    }
  };

  const getTotalUnits = () => {
    return units.length;
  };

  const getRecommendedPlan = () => {
    const totalUnits = getTotalUnits();
    if (totalUnits <= 50) return PLANS[0];
    if (totalUnits <= 200) return PLANS[1];
    return null; // يحتاج باقة مخصصة
  };

  const getCurrentPlan = () => {
    if (!subscription) return null;
    return PLANS.find(p => p.id === subscription.plan);
  };

  const getDaysRemaining = () => {
    if (!subscription || !subscription.end_date) return 0;
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const diff = endDate - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isExpired = () => {
    return getDaysRemaining() < 0;
  };

  const isExpiringSoon = () => {
    const days = getDaysRemaining();
    return days > 0 && days <= 7;
  };

  const canUpgrade = (plan) => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return true;
    return PLANS.indexOf(plan) > PLANS.indexOf(currentPlan);
  };

  const canSubscribeToPlan = (plan) => {
    const totalUnits = getTotalUnits();
    const buildingCount = buildings.length;

    if (buildingCount > 1) {
      return { valid: false, message: 'لديك أكثر من عمارة واحدة. الباقات الحالية لعمارة واحدة فقط.' };
    }

    if (totalUnits > plan.maxUnits) {
      return { valid: false, message: `عدد الشقق (${totalUnits}) يتجاوز الحد المسموح (${plan.maxUnits})` };
    }

    return { valid: true };
  };

  const handleSubscribe = (plan) => {
    const validation = canSubscribeToPlan(plan);
    if (!validation.valid) {
      error(`❌ ${validation.message}`);
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleRenew = () => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return;

    const validation = canSubscribeToPlan(currentPlan);
    if (!validation.valid) {
      error(`❌ ${validation.message}`);
      return;
    }

    setSelectedPlan(currentPlan);
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    try {
      const userType = localStorage.getItem('userType');
      const customerId = userType === 'customer' ? currentUser.id : currentUser.customer_id;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const newSubscription = {
        customer_id: customerId,
        plan: selectedPlan.id,
        amount: selectedPlan.price,
        currency: 'EGP',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        auto_renew: true,
        payment_method: 'cash',
        paid_at: new Date().toISOString()
      };

      if (subscription) {
        // تحديث الاشتراك الحالي
        await axios.put(`${API_URL}/subscriptions/${subscription.id}`, {
          ...subscription,
          ...newSubscription
        });
        success('✅ تم تجديد الاشتراك بنجاح');
      } else {
        // إنشاء اشتراك جديد
        await axios.post(`${API_URL}/subscriptions`, newSubscription);
        success('✅ تم الاشتراك بنجاح');
      }

      setShowPaymentModal(false);
      setSelectedPlan(null);
      loadData();
    } catch (err) {
      console.error('Error processing payment:', err);
      error('❌ فشل في معالجة الدفع');
    }
  };

  if (loading) {
    return <div className="loading-spinner">جاري التحميل...</div>;
  }

  const currentPlan = getCurrentPlan();
  const daysRemaining = getDaysRemaining();
  const totalUnits = getTotalUnits();
  const recommendedPlan = getRecommendedPlan();

  return (
    <div className="my-subscription-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="page-header">
        <h1>📱 اشتراكي في النظام</h1>
        <p>إدارة اشتراكك في استخدام النظام واختيار الباقة المناسبة (200 أو 400 جنيه شهرياً)</p>
      </div>

      {/* بطاقة الاشتراك الحالي */}
      <div className="current-subscription-card">
        <div className="subscription-header">
          <h2>الاشتراك الحالي</h2>
          {subscription && (
            <div className={`status-badge ${isExpired() ? 'expired' : isExpiringSoon() ? 'expiring' : 'active'}`}>
              {isExpired() ? '❌ منتهي' : isExpiringSoon() ? '⚠️ قريب الانتهاء' : '✅ نشط'}
            </div>
          )}
        </div>

        {subscription && currentPlan ? (
          <div className="current-plan-info">
            <div className="plan-icon" style={{ color: currentPlan.color }}>
              {currentPlan.icon}
            </div>
            <div className="plan-details">
              <h3>{currentPlan.name}</h3>
              <p className="plan-price">{currentPlan.price} جنيه مصري / شهر</p>
              <div className="subscription-dates">
                <div className="date-item">
                  <span className="label">تاريخ البدء:</span>
                  <span className="value">{new Date(subscription.start_date).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="date-item">
                  <span className="label">تاريخ الانتهاء:</span>
                  <span className="value">{new Date(subscription.end_date).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="date-item">
                  <span className="label">الأيام المتبقية:</span>
                  <span className={`value ${daysRemaining <= 7 ? 'warning' : ''}`}>
                    {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
                  </span>
                </div>
              </div>
            </div>
            <button className="renew-button" onClick={handleRenew}>
              🔄 تجديد الاشتراك
            </button>
          </div>
        ) : (
          <div className="no-subscription">
            <div className="empty-icon">📭</div>
            <h3>لا يوجد اشتراك نشط</h3>
            <p>اختر الباقة المناسبة وابدأ استخدام النظام</p>
          </div>
        )}
      </div>

      {/* إحصائيات */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h4>عدد العمارات</h4>
            <p className="stat-value">{buildings.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏠</div>
          <div className="stat-info">
            <h4>إجمالي الوحدات</h4>
            <p className="stat-value">{totalUnits}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h4>الباقة الموصى بها</h4>
            <p className="stat-value">{recommendedPlan ? recommendedPlan.name : 'مخصصة'}</p>
          </div>
        </div>
      </div>

      {/* الباقات المتاحة */}
      <div className="plans-section">
        <h2>الباقات المتاحة</h2>
        <div className="plans-grid">
          {PLANS.map(plan => {
            const validation = canSubscribeToPlan(plan);
            const isCurrentPlan = currentPlan && currentPlan.id === plan.id;
            
            return (
              <div key={plan.id} className={`plan-card ${isCurrentPlan ? 'current' : ''}`}>
                <div className="plan-header" style={{ backgroundColor: plan.color }}>
                  <div className="plan-icon-large">{plan.icon}</div>
                  <h3>{plan.name}</h3>
                  <p className="plan-price-large">{plan.price} جنيه</p>
                  <p className="plan-period">/ شهر</p>
                </div>
                <div className="plan-body">
                  <div className="plan-limits">
                    <div className="limit-item">
                      <span className="limit-icon">🏢</span>
                      <span>عمارة واحدة فقط</span>
                    </div>
                    <div className="limit-item">
                      <span className="limit-icon">🏠</span>
                      <span>حتى {plan.maxUnits} شقة</span>
                    </div>
                  </div>
                  <div className="plan-features">
                    <h4>المميزات:</h4>
                    <ul>
                      {plan.features.map((feature, idx) => (
                        <li key={idx}>
                          <span className="feature-check">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="plan-footer">
                  {isCurrentPlan ? (
                    <button className="plan-button current-plan-button" disabled>
                      ✓ الباقة الحالية
                    </button>
                  ) : !validation.valid ? (
                    <div className="plan-warning">
                      <span className="warning-icon">⚠️</span>
                      <span className="warning-text">{validation.message}</span>
                    </div>
                  ) : (
                    <button
                      className="plan-button"
                      onClick={() => handleSubscribe(plan)}
                    >
                      {currentPlan && canUpgrade(plan) ? '⬆️ ترقية الباقة' : '📝 اشترك الآن'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* نافذة الدفع */}
      {showPaymentModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>تأكيد الاشتراك</h2>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="payment-summary">
                <div className="summary-icon" style={{ color: selectedPlan.color }}>
                  {selectedPlan.icon}
                </div>
                <h3>{selectedPlan.name}</h3>
                <div className="payment-details">
                  <div className="detail-row">
                    <span>المبلغ:</span>
                    <span className="amount">{selectedPlan.price} جنيه مصري</span>
                  </div>
                  <div className="detail-row">
                    <span>المدة:</span>
                    <span>شهر واحد</span>
                  </div>
                  <div className="detail-row">
                    <span>تاريخ البدء:</span>
                    <span>{new Date().toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="detail-row">
                    <span>تاريخ الانتهاء:</span>
                    <span>{new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
                <div className="payment-note">
                  💡 سيتم تجديد الاشتراك تلقائياً كل شهر
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPaymentModal(false)}>
                إلغاء
              </button>
              <button className="btn-confirm" onClick={confirmPayment}>
                💳 تأكيد الدفع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MySubscription;
