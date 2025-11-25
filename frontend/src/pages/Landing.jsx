import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [openFAQ, setOpenFAQ] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    businessName: ''
  });

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const plans = [
    {
      id: 'monthly',
      name: 'الباقة الشهرية',
      price: 200,
      duration: 'شهرياً',
      features: [
        'حتى 5 عمارات',
        'عدد لا محدود من الوحدات',
        'إدارة الملاك والمستأجرين',
        'إصدار الفواتير',
        'تحصيل الإيجارات',
        'تقارير شهرية',
        'دعم فني'
      ]
    },
    {
      id: 'premium',
      name: 'الباقة المميزة',
      price: 400,
      duration: 'شهرياً',
      features: [
        'عمارات غير محدودة',
        'عدد لا محدود من الوحدات',
        'إدارة الملاك والمستأجرين',
        'إصدار الفواتير',
        'تحصيل الإيجارات',
        'تقارير شهرية وسنوية',
        'دعم فني متميز 24/7',
        'نسخ احتياطي يومي',
        'تكامل مع بوابات الدفع'
      ],
      recommended: true
    }
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const customerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        business_name: formData.businessName,
        role: 'owner',
        subscription_plan: selectedPlan,
        subscription_status: 'trial',
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial
        status: 'active',
        created_at: new Date().toISOString()
      };

      await axios.post(`${API_BASE_URL}/customers`, customerData);
      
      alert('✅ تم إنشاء حسابك بنجاح! يمكنك تسجيل الدخول الآن\n🎁 تم تفعيل تجربة مجانية لمدة 7 أيام');
      navigate('/login');
    } catch (error) {
      console.error('Error registering:', error);
      alert('❌ حدث خطأ في التسجيل. يرجى المحاولة مرة أخرى');
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">🏢 سَكَن</h1>
            <nav className="main-nav">
              <a href="#features">المميزات</a>
              <a href="#pricing">الأسعار</a>
              <a href="#contact">تواصل معنا</a>
              <button className="btn-login" onClick={() => navigate('/login')}>
                تسجيل الدخول
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">🏆 الحل الأمثل لإدارة العقارات في مصر</div>
            <h1 className="hero-title">
              إدارة عماراتك بسهولة وشفافية
              <span className="highlight">ريّح بالك!</span>
            </h1>
            <p className="hero-subtitle">
              نظام متكامل لإدارة العمارات والوحدات - تحصيل إيجارات، إصدار فواتير، متابعة المستأجرين من مكان واحد
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">+500</div>
                <div className="stat-label">عمارة مسجلة</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">+2000</div>
                <div className="stat-label">وحدة سكنية</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99%</div>
                <div className="stat-label">رضا العملاء</div>
              </div>
            </div>
            <div className="hero-buttons">
              <button className="btn-primary-large" onClick={() => setShowRegisterForm(true)}>
                🎁 جرب مجاناً لمدة 7 أيام
              </button>
              <button className="btn-secondary-large" onClick={() => navigate('/login')}>
                تسجيل الدخول
              </button>
            </div>
            <p className="trial-note">✨ بدون بطاقة ائتمان - ابدأ الآن في دقائق</p>
          </div>
        </div>
      </section>

      {/* Why Sakan Section */}
      <section className="why-section">
        <div className="container">
          <h2 className="section-title">لماذا سَكَن؟</h2>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">⏱️</div>
              <h3>وفر وقتك</h3>
              <p>توليد تقارير تلقائية - لن تحتاج لساعات من الحسابات اليدوية بعد الآن</p>
            </div>
            <div className="why-card">
              <div className="why-icon">📱</div>
              <h3>تواصل بسهولة</h3>
              <p>إشعارات تلقائية للمستأجرين - رسائل تذكير شهرية وتنبيهات فورية</p>
            </div>
            <div className="why-card">
              <div className="why-icon">🔍</div>
              <h3>شفافية كاملة</h3>
              <p>يمكن للمستأجرين متابعة رصيدهم وفواتيرهم في أي وقت - بدون مكالمات</p>
            </div>
            <div className="why-card">
              <div className="why-icon">📊</div>
              <h3>استيراد من Excel</h3>
              <p>انقل بياناتك الحالية بضغطة واحدة - لا داعي لإدخال البيانات يدوياً</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="steps-section">
        <div className="container">
          <h2 className="section-title">خطوات بسيطة لتبدأ</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">🏢</div>
              <h3>أدخل بيانات عماراتك</h3>
              <p>أضف العمارات والوحدات السكنية في دقائق</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">👥</div>
              <h3>سجل المستأجرين</h3>
              <p>أدخل بيانات المستأجرين أو استوردها من ملف Excel</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">💰</div>
              <h3>ابدأ الإدارة</h3>
              <p>سجل المصروفات والإيرادات وراقب كل شيء بسهولة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">لماذا تختار سَكَن؟</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>إدارة العمارات</h3>
              <p>سجل جميع عماراتك ووحداتك بكل سهولة مع تفاصيل شاملة</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>إدارة المستأجرين</h3>
              <p>متابعة بيانات الملاك والمستأجرين وعقود الإيجار</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>تحصيل الإيجارات</h3>
              <p>تحصيل الإيجارات تلقائياً وإرسال إشعارات للمتأخرين</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>إصدار الفواتير</h3>
              <p>إنشاء فواتير احترافية للإيجارات والخدمات</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>تقارير مفصلة</h3>
              <p>تقارير شاملة عن الإيرادات والمصروفات والإشغال</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>متاح على الجوال</h3>
              <p>تصميم متجاوب يعمل على جميع الأجهزة</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>إشعارات تلقائية</h3>
              <p>تنبيهات للإيجارات المستحقة وانتهاء العقود</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>بوابات الدفع</h3>
              <p>تكامل مع فوري وPaymob للدفع الإلكتروني</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">قالوا عن سَكَن</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">
                النظام سهل جداً وخلاني أتابع كل حاجة من الموبايل. بقيت مرتاح وانا بحصل الإيجارات
              </p>
              <div className="testimonial-author">
                <strong>أحمد محمود</strong>
                <span>مالك عمارة - المعادي</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">
                بصراحة نظام رائع! وفر عليا ساعات من الحسابات اليدوية. التقارير بتطلع أوتوماتيك
              </p>
              <div className="testimonial-author">
                <strong>م. سعيد الشافعي</strong>
                <span>إدارة عقارات - التجمع الخامس</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">
                ريحني من ملفات إكسل كتير والأوراق المبعثرة. كل حاجة منظمة ومحفوظة في مكان واحد
              </p>
              <div className="testimonial-author">
                <strong>خالد عبدالله</strong>
                <span>مدير عمارة - مدينة نصر</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="video-section">
        <div className="container">
          <div className="video-content">
            <h2 className="section-title">شاهد كيف يعمل النظام</h2>
            <p className="video-subtitle">جولة سريعة توضح سهولة الاستخدام في أقل من دقيقتين</p>
            <div className="video-placeholder">
              <div className="play-button">▶️</div>
              <p>فيديو توضيحي قريباً</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" id="faq">
        <div className="container">
          <h2 className="section-title">أسئلة شائعة</h2>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(0)}>
                <span>هل النظام مجاني؟</span>
                <span className="faq-toggle">{openFAQ === 0 ? '−' : '+'}</span>
              </div>
              {openFAQ === 0 && (
                <div className="faq-answer">
                  نعم، يمكنك تجربة النظام مجاناً لمدة 7 أيام بدون بطاقة ائتمان. بعد ذلك يمكنك الاشتراك الشهري بـ 200 جنيه أو الباقة المميزة بـ 400 جنيه.
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(1)}>
                <span>هل النظام سهل الاستخدام؟</span>
                <span className="faq-toggle">{openFAQ === 1 ? '−' : '+'}</span>
              </div>
              {openFAQ === 1 && (
                <div className="faq-answer">
                  نعم! صممناه ليكون بسيط جداً. لا تحتاج خبرة تقنية - فقط أدخل بياناتك وابدأ. كما يوجد فيديو توضيحي ودعم فني متاح.
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(2)}>
                <span>هل يوجد دعم فني؟</span>
                <span className="faq-toggle">{openFAQ === 2 ? '−' : '+'}</span>
              </div>
              {openFAQ === 2 && (
                <div className="faq-answer">
                  نعم، الدعم الفني متاح عبر الواتساب والهاتف. المشتركون في الباقة المميزة يحصلون على دعم فني متقدم على مدار 24/7.
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(3)}>
                <span>هل يمكنني استيراد بياناتي الحالية؟</span>
                <span className="faq-toggle">{openFAQ === 3 ? '−' : '+'}</span>
              </div>
              {openFAQ === 3 && (
                <div className="faq-answer">
                  نعم! يمكنك استيراد بيانات المستأجرين والوحدات من ملفات Excel بضغطة واحدة. لن تحتاج لإدخال البيانات يدوياً.
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(4)}>
                <span>هل بياناتي آمنة؟</span>
                <span className="faq-toggle">{openFAQ === 4 ? '−' : '+'}</span>
              </div>
              {openFAQ === 4 && (
                <div className="faq-answer">
                  بالتأكيد! جميع البيانات مشفرة ومحفوظة على خوادم آمنة. نأخذ نسخ احتياطية يومية لحماية معلوماتك.
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(5)}>
                <span>ماذا أحتاج للبدء؟</span>
                <span className="faq-toggle">{openFAQ === 5 ? '−' : '+'}</span>
              </div>
              {openFAQ === 5 && (
                <div className="faq-answer">
                  فقط بريد إلكتروني ورقم هاتف! سجل الآن وابدأ إدخال بيانات عماراتك في دقائق. يمكنك استخدام النظام من الكمبيوتر أو الموبايل.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <h2 className="section-title">اختر الباقة المناسبة لك</h2>
          <div className="pricing-grid">
            {plans.map(plan => (
              <div key={plan.id} className={`pricing-card ${plan.recommended ? 'recommended' : ''}`}>
                {plan.recommended && <div className="recommended-badge">الأكثر طلباً</div>}
                <h3>{plan.name}</h3>
                <div className="price">
                  <span className="amount">{plan.price}</span>
                  <span className="currency">جنيه</span>
                </div>
                <p className="duration">{plan.duration}</p>
                <ul className="features-list">
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <span className="checkmark">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  className="btn-subscribe"
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setShowRegisterForm(true);
                  }}
                >
                  اشترك الآن
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2 className="section-title">تواصل معنا</h2>
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <h3>الهاتف</h3>
              <p>01000511969</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <h3>البريد الإلكتروني</h3>
              <p>support@sakan.com</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">💬</div>
              <h3>واتساب</h3>
              <p>01000511969</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🏢 سَكَن</h3>
              <p>نظام إدارة العقارات الأول في مصر</p>
              <p>نساعدك في إدارة عماراتك بسهولة وشفافية</p>
            </div>
            
            <div className="footer-section">
              <h4>روابط سريعة</h4>
              <ul>
                <li><a href="#features">المميزات</a></li>
                <li><a href="#pricing">الأسعار</a></li>
                <li><a href="#contact">تواصل معنا</a></li>
                <li><a href="#faq">الأسئلة الشائعة</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>تواصل معنا</h4>
              <ul>
                <li>📞 01000511969</li>
                <li>📧 support@sakan.com</li>
                <li>📍 القاهرة، مصر</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>تابعنا</h4>
              <div className="social-links">
                <a href="#" className="social-icon">📘 فيسبوك</a>
                <a href="#" className="social-icon">📷 انستجرام</a>
                <a href="#" className="social-icon">💼 لينكد إن</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 سَكَن - نظام إدارة العقارات | جميع الحقوق محفوظة لشركة نهج للتحول الرقمي</p>
            <p className="footer-note">منذ 2025 • مصر 🇪🇬</p>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      {showRegisterForm && (
        <div className="modal-overlay" onClick={() => setShowRegisterForm(false)}>
          <div className="modal-content register-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRegisterForm(false)}>✕</button>
            <h2>إنشاء حساب جديد</h2>
            <p className="modal-subtitle">
              الباقة المختارة: <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong>
            </p>
            
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>الاسم الكامل *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div className="form-group">
                <label>اسم الشركة / المؤسسة</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  placeholder="اختياري"
                />
              </div>

              <div className="form-group">
                <label>البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="example@domain.com"
                />
              </div>

              <div className="form-group">
                <label>رقم الهاتف *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="form-group">
                <label>كلمة المرور *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  placeholder="أدخل كلمة مرور قوية"
                  minLength="6"
                />
              </div>

              <div className="trial-info">
                <p>🎁 <strong>تجربة مجانية لمدة 7 أيام</strong></p>
                <p>لن يتم تحصيل أي رسوم خلال فترة التجربة</p>
              </div>

              <button type="submit" className="btn-submit">
                إنشاء الحساب وبدء التجربة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
