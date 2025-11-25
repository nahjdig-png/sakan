const db = require('./config/database');
const { hashPassword } = require('./utils/auth');

async function createCompleteTestData() {
  try {
    console.log('🏗️  Creating comprehensive test data...\n');
    
    // Hash password
    const hashedPassword = await hashPassword('123456');
    
    // ============================================================================
    // 1. إنشاء العملاء (Customers)
    // ============================================================================
    console.log('👥 Creating test customers...');
    
    // تحقق من وجود العملاء
    const [existingCustomers] = await db.query('SELECT COUNT(*) as count FROM customers');
    
    if (existingCustomers[0].count === 0) {
      const customers = [
        ['مدير النظام', 'admin@sakan.com', hashedPassword, '01234567890', 'القاهرة، مصر', 'admin', 'active', 100, 1000],
        ['أحمد محمد علي', 'ahmed@sakan.com', hashedPassword, '01012345678', 'المعادي، القاهرة', 'manager', 'active', 10, 50],
        ['سارة أحمد حسن', 'sara@sakan.com', hashedPassword, '01123456789', 'مدينة نصر، القاهرة', 'manager', 'active', 5, 25],
        ['محمود إبراهيم', 'mahmoud@sakan.com', hashedPassword, '01234567891', 'الجيزة، مصر', 'manager', 'active', 8, 40]
      ];
      
      for (const customer of customers) {
        await db.query(
          `INSERT INTO customers (name, email, password, phone, address, role, status, max_buildings, max_units, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          customer
        );
      }
      console.log('✅ Customers created successfully');
    } else {
      console.log('ℹ️  Customers already exist');
    }

    // ============================================================================
    // 2. إنشاء الملاك (Owners)
    // ============================================================================
    console.log('🏠 Creating test owners...');
    
    const [existingOwners] = await db.query('SELECT COUNT(*) as count FROM owners');
    
    if (existingOwners[0].count === 0) {
      const owners = [
        ['أحمد محمد علي', 'ahmed.owner@example.com', '01012345678', '28901012345678', 'شارع النيل، المعادي', 'القاهرة', 'مصر', 'individual', null],
        ['سارة أحمد حسن', 'sara.owner@example.com', '01123456789', '29201234567890', 'مدينة نصر', 'القاهرة', 'مصر', 'individual', null],
        ['شركة العقارات المتقدمة', 'info@realestate.com', '0225551234', '1234567890', 'وسط البلد', 'القاهرة', 'مصر', 'company', 'شركة العقارات المتقدمة'],
        ['محمد حسن علي', 'mohamed.owner@example.com', '01087654321', '29012345678901', 'الدقي، الجيزة', 'الجيزة', 'مصر', 'individual', null]
      ];
      
      for (const owner of owners) {
        await db.query(
          `INSERT INTO owners (name, email, phone, national_id, address, city, country, owner_type, company_name, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          owner
        );
      }
      console.log('✅ Owners created successfully');
    } else {
      console.log('ℹ️  Owners already exist');
    }

    // ============================================================================
    // 3. إنشاء المباني (Buildings)
    // ============================================================================
    console.log('🏢 Creating test buildings...');
    
    const [existingBuildings] = await db.query('SELECT COUNT(*) as count FROM buildings');
    
    if (existingBuildings[0].count === 0) {
      // الحصول على معرفات العملاء
      const [customerIds] = await db.query('SELECT id FROM customers WHERE role = "manager" ORDER BY id LIMIT 3');
      
      const buildings = [
        ['برج النيل السكني', 'شارع النيل، المعادي، القاهرة', 20, customerIds[0].id, 'برج سكني حديث مكون من 20 وحدة', 'active', 'القاهرة', 10, 2020, 'residential'],
        ['مجمع الأندلس التجاري', 'شارع التحرير، وسط البلد، القاهرة', 15, customerIds[1].id, 'مجمع تجاري في قلب القاهرة', 'active', 'القاهرة', 5, 2018, 'commercial'],
        ['برج العاصمة المختلط', 'مدينة نصر، القاهرة', 30, customerIds[2].id, 'برج مختلط سكني وتجاري', 'active', 'القاهرة', 15, 2019, 'mixed'],
        ['فيلات الجولف', 'مدينة 6 أكتوبر، الجيزة', 8, customerIds[0].id, 'مجموعة فيلات راقية', 'active', 'الجيزة', 2, 2021, 'villa']
      ];
      
      for (const building of buildings) {
        await db.query(
          `INSERT INTO buildings (name, address, total_units, customer_id, description, status, city, floors, year_built, building_type, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          building
        );
      }
      console.log('✅ Buildings created successfully');
    } else {
      console.log('ℹ️  Buildings already exist');
    }

    // ============================================================================
    // 4. إنشاء الوحدات (Units)
    // ============================================================================
    console.log('🏠 Creating test units...');
    
    const [existingUnits] = await db.query('SELECT COUNT(*) as count FROM units');
    
    if (existingUnits[0].count === 0) {
      // الحصول على معرفات المباني
      const [buildingIds] = await db.query('SELECT id, total_units FROM buildings ORDER BY id');
      
      let unitCounter = 0;
      for (const building of buildingIds) {
        for (let i = 1; i <= Math.min(building.total_units, 5); i++) {
          const unitTypes = ['apartment', 'shop', 'office', 'villa'];
          const statuses = ['occupied', 'vacant', 'maintenance'];
          
          await db.query(
            `INSERT INTO units (unit_number, building_id, status, unit_type, area_sqm, floor_number, monthly_rent, bedrooms, bathrooms, description, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              `${i.toString().padStart(3, '0')}`,
              building.id,
              statuses[Math.floor(Math.random() * statuses.length)],
              unitTypes[Math.floor(Math.random() * unitTypes.length)],
              80 + Math.floor(Math.random() * 120), // مساحة من 80 إلى 200
              Math.floor((i - 1) / 4) + 1, // توزيع على الطوابق
              1500 + Math.floor(Math.random() * 2000), // إيجار من 1500 إلى 3500
              2 + Math.floor(Math.random() * 3), // غرف نوم من 2 إلى 4
              1 + Math.floor(Math.random() * 2), // حمامات من 1 إلى 2
              `وحدة رقم ${i} - ${unitTypes[Math.floor(Math.random() * unitTypes.length)]}`
            ]
          );
          unitCounter++;
        }
      }
      console.log(`✅ ${unitCounter} units created successfully`);
    } else {
      console.log('ℹ️  Units already exist');
    }

    // ============================================================================
    // 5. إنشاء الخطط (Plans)
    // ============================================================================
    console.log('📋 Creating subscription plans...');
    
    const [existingPlans] = await db.query('SELECT COUNT(*) as count FROM plans');
    
    if (existingPlans[0].count === 0) {
      const plans = [
        ['الباقة الأساسية', 10, 200, 'EGP', 'خطة مناسبة للمباني الصغيرة حتى 10 وحدات', '["إدارة حتى 10 وحدات", "تقارير أساسية", "دعم فني"]', 'monthly', 'active'],
        ['الباقة المتوسطة', 50, 500, 'EGP', 'خطة للمباني المتوسطة حتى 50 وحدة', '["إدارة حتى 50 وحدة", "تقارير متقدمة", "دعم فني مميز", "تطبيق الهاتف"]', 'monthly', 'active'],
        ['الباقة المتقدمة', 100, 1000, 'EGP', 'خطة للمباني الكبيرة حتى 100 وحدة', '["إدارة حتى 100 وحدة", "جميع التقارير", "دعم فني 24/7", "تطبيق الهاتف", "تحليلات متقدمة"]', 'monthly', 'active'],
        ['الباقة السنوية', 50, 5000, 'EGP', 'باقة سنوية بخصم 17%', '["إدارة حتى 50 وحدة", "جميع المميزات", "دعم فني مجاني", "تحديثات مجانية"]', 'yearly', 'active']
      ];
      
      for (const plan of plans) {
        await db.query(
          `INSERT INTO plans (plan_name, total_units, price, currency, description, features, billing_cycle, status, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          plan
        );
      }
      console.log('✅ Plans created successfully');
    } else {
      console.log('ℹ️  Plans already exist');
    }

    console.log('\n🎉 All test data created successfully!');
    console.log('\n📊 Summary:');
    
    // عرض ملخص البيانات
    const [customerCount] = await db.query('SELECT COUNT(*) as count FROM customers');
    const [ownerCount] = await db.query('SELECT COUNT(*) as count FROM owners');
    const [buildingCount] = await db.query('SELECT COUNT(*) as count FROM buildings');
    const [unitCount] = await db.query('SELECT COUNT(*) as count FROM units');
    const [planCount] = await db.query('SELECT COUNT(*) as count FROM plans');
    
    console.log(`👥 Customers: ${customerCount[0].count}`);
    console.log(`🏠 Owners: ${ownerCount[0].count}`);
    console.log(`🏢 Buildings: ${buildingCount[0].count}`);
    console.log(`🏠 Units: ${unitCount[0].count}`);
    console.log(`📋 Plans: ${planCount[0].count}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@sakan.com / 123456');
    console.log('Customer 1: ahmed@sakan.com / 123456');
    console.log('Customer 2: sara@sakan.com / 123456');
    console.log('Customer 3: mahmoud@sakan.com / 123456');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
  } finally {
    process.exit(0);
  }
}

createCompleteTestData();