import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { API_BASE_URL } from '../config/constants';
import './Subscriptions.css';

const API_URL = API_BASE_URL;

function Subscriptions() {
  const [customers, setCustomers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { toasts, success, error, removeToast } = useToast();

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
      const [customersRes, buildingsRes, subsRes] = await Promise.all([
        axios.get(`${API_URL}/customers`),
        axios.get(`${API_URL}/buildings`),
        axios.get(`${API_URL}/subscriptions`)
      ]);

      setCustomers(customersRes.data);
      setBuildings(buildingsRes.data);
      setSubscriptions(subsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      error('❌ فشل في تحميل البيانات');
      setLoading(false);
    }
  };

  const getCustomerBuildings = (customerId) => {
    return buildings.filter(b => b.customer_id === customerId);
  };

  const getCustomerSubscription = (customerId) => {
    return subscriptions.find(s => s.customer_id === customerId && s.status === 'active');
  };

  const calculateTotalUnits = (customerId) => {
    const customerBuildings = getCustomerBuildings(customerId);
    return customerBuildings.reduce((total, building) => total + (building.units_count || 0), 0);
  };

  const getRecommendedPlan = (totalUnits) => {
    if (totalUnits <= 50) return PLANS[0];
    if (totalUnits <= 200) return PLANS[1];
    return null; // يحتاج باقة مخصصة
  };

  const handleSubscribe = async (customerId, plan) => {
    try {
      const totalUnits = calculateTotalUnits(customerId);
      
      if (totalUnits > plan.maxUnits) {
        error(`❌ عدد الشقق (${totalUnits}) يتجاوز حد الباقة (${plan.maxUnits} شقة)`);
        return;
      }

      const customerBuildings = getCustomerBuildings(customerId);
      if (customerBuildings.length > 1) {
        error('❌ هذه الباقة تدعم عمارة واحدة فقط');
        return;
      }

      // حساب تاريخ الانتهاء (شهر واحد)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const subscriptionData = {
        customer_id: customerId,
        plan: plan.id,
        plan_name: plan.name,
        amount: plan.price,
        currency: 'EGP',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        auto_renew: true,
        units_count: totalUnits,
        buildings_count: customerBuildings.length
      };

      await axios.post(`${API_URL}/subscriptions`, subscriptionData);

      // تحديث حالة العميل
      const customer = customers.find(c => c.id === customerId);
      await axios.patch(`${API_URL}/customers/${customerId}`, {
        subscription_plan: plan.id,
        subscription_status: 'active',
        subscription_start: startDate.toISOString(),
        subscription_end: endDate.toISOString()
      });

      success('✅ تم تفعيل الاشتراك بنجاح');
      loadData();
      setShowForm(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Error subscribing:', err);
      error('❌ فشل في تفعيل الاشتراك');
    }
  };

  const handleRenewSubscription = async (customerId) => {
    try {
      const subscription = getCustomerSubscription(customerId);
      if (!subscription) return;

      const plan = PLANS.find(p => p.id === subscription.plan);
      if (!plan) return;

      // تمديد الاشتراك لشهر إضافي
      const newEndDate = new Date(subscription.end_date);
      newEndDate.setMonth(newEndDate.getMonth() + 1);

      await axios.patch(`${API_URL}/subscriptions/${subscription.id}`, {
        end_date: newEndDate.toISOString(),
        status: 'active'
      });

      await axios.patch(`${API_URL}/customers/${customerId}`, {
        subscription_status: 'active',
        subscription_end: newEndDate.toISOString()
      });

      success('✅ تم تجديد الاشتراك بنجاح');
      loadData();
    } catch (err) {
      console.error('Error renewing subscription:', err);
      error('❌ فشل في تجديد الاشتراك');
    }
  };

  const handleCancelSubscription = async (customerId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء الاشتراك؟')) return;

    try {
      const subscription = getCustomerSubscription(customerId);
      if (!subscription) return;

      await axios.patch(`${API_URL}/subscriptions/${subscription.id}`, {
        status: 'cancelled'
      });

      await axios.patch(`${API_URL}/customers/${customerId}`, {
        subscription_status: 'cancelled'
      });

      success('✅ تم إلغاء الاشتراك');
      loadData();
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      error('❌ فشل في إلغاء الاشتراك');
    }
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusBadge = (subscription) => {
    if (!subscription) {
      return <span className="status-badge inactive">غير مشترك</span>;
    }

    const daysRemaining = getDaysRemaining(subscription.end_date);

    if (subscription.status === 'cancelled') {
      return <span className="status-badge cancelled">ملغي</span>;
    }

    if (daysRemaining <= 0) {
      return <span className="status-badge expired">منتهي</span>;
    }

    if (daysRemaining <= 7) {
      return <span className="status-badge expiring">ينتهي قريباً ({daysRemaining} يوم)</span>;
    }

    return <span className="status-badge active">نشط</span>;
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="subscriptions-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="page-header">
        <div>
          <h1>⚙️ إدارة اشتراكات النظام</h1>
          <p>إدارة اشتراكات العملاء في استخدام النظام (الباقات والخطط)</p>
        </div>
      </div>

      {/* خطط الاشتراك */}
      <div className="plans-section">
        <h2>📋 خطط الاشتراك المتاحة</h2>
        <div className="plans-grid">
          {PLANS.map(plan => (
            <div key={plan.id} className="plan-card" style={{ borderColor: plan.color }}>
              <div className="plan-header" style={{ backgroundColor: plan.color }}>
                <span className="plan-icon">{plan.icon}</span>
                <h3>{plan.name}</h3>
              </div>
              <div className="plan-body">
                <div className="plan-price">
                  <span className="amount">{plan.price}</span>
                  <span className="currency">جنيه</span>
                  <span className="period">/ شهرياً</span>
                </div>
                <div className="plan-limits">
                  <p>🏢 عمارة واحدة فقط</p>
                  <p>🏠 حتى {plan.maxUnits} شقة</p>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* قائمة العملاء واشتراكاتهم */}
      <div className="customers-section">
        <h2>👥 العملاء والاشتراكات</h2>
        <div className="customers-table">
          <table>
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>البريد الإلكتروني</th>
                <th>عدد العمارات</th>
                <th>عدد الشقق</th>
                <th>الخطة الحالية</th>
                <th>الحالة</th>
                <th>تاريخ الانتهاء</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => {
                const subscription = getCustomerSubscription(customer.id);
                const buildingsCount = getCustomerBuildings(customer.id).length;
                const totalUnits = calculateTotalUnits(customer.id);
                const recommendedPlan = getRecommendedPlan(totalUnits);

                return (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{buildingsCount}</td>
                    <td>{totalUnits}</td>
                    <td>
                      {subscription ? (
                        <span className="plan-badge" style={{ 
                          backgroundColor: PLANS.find(p => p.id === subscription.plan)?.color + '20',
                          color: PLANS.find(p => p.id === subscription.plan)?.color
                        }}>
                          {subscription.plan_name}
                        </span>
                      ) : (
                        <span className="no-plan">لا يوجد</span>
                      )}
                    </td>
                    <td>{getStatusBadge(subscription)}</td>
                    <td>
                      {subscription ? new Date(subscription.end_date).toLocaleDateString('ar-EG') : '-'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {!subscription ? (
                          <button
                            className="btn-subscribe"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowForm(true);
                            }}
                            disabled={!recommendedPlan}
                            title={!recommendedPlan ? 'عدد الشقق يتجاوز الحد المسموح' : ''}
                          >
                            اشتراك جديد
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn-renew"
                              onClick={() => handleRenewSubscription(customer.id)}
                            >
                              تجديد
                            </button>
                            <button
                              className="btn-cancel"
                              onClick={() => handleCancelSubscription(customer.id)}
                            >
                              إلغاء
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* نموذج الاشتراك */}
      {showForm && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>اختر خطة الاشتراك</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="customer-info">
                <h3>معلومات العميل</h3>
                <p><strong>الاسم:</strong> {selectedCustomer.name}</p>
                <p><strong>عدد العمارات:</strong> {getCustomerBuildings(selectedCustomer.id).length}</p>
                <p><strong>عدد الشقق:</strong> {calculateTotalUnits(selectedCustomer.id)}</p>
              </div>

              <div className="plans-selection">
                {PLANS.map(plan => {
                  const totalUnits = calculateTotalUnits(selectedCustomer.id);
                  const buildingsCount = getCustomerBuildings(selectedCustomer.id).length;
                  const isEligible = totalUnits <= plan.maxUnits && buildingsCount <= 1;

                  return (
                    <div 
                      key={plan.id} 
                      className={`plan-option ${isEligible ? '' : 'disabled'}`}
                    >
                      <div className="plan-header-small" style={{ backgroundColor: plan.color }}>
                        <span>{plan.icon}</span>
                        <h4>{plan.name}</h4>
                      </div>
                      <div className="plan-details">
                        <p className="price">{plan.price} جنيه / شهرياً</p>
                        <p className="limits">حتى {plan.maxUnits} شقة</p>
                        {!isEligible && (
                          <p className="error-msg">
                            {buildingsCount > 1 ? '❌ تدعم عمارة واحدة فقط' : '❌ عدد الشقق يتجاوز الحد'}
                          </p>
                        )}
                        <button
                          className="btn-select"
                          onClick={() => handleSubscribe(selectedCustomer.id, plan)}
                          disabled={!isEligible}
                        >
                          {isEligible ? 'اختيار هذه الخطة' : 'غير متاح'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subscriptions;
