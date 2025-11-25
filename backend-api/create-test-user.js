const db = require('./config/database');
const { hashPassword } = require('./utils/auth');

async function createTestUser() {
  try {
    console.log('🔧 Creating test customer and admin user...');
    
    // Hash password
    const hashedPassword = await hashPassword('123456');
    
    // Check if admin user already exists
    const [existing] = await db.query(
      'SELECT id FROM customers WHERE email = ?',
      ['admin@sakan.com']
    );

    if (existing.length > 0) {
      console.log('✅ Admin user already exists');
      
      // Check for test customer
      const [testCustomer] = await db.query(
        'SELECT id FROM customers WHERE email = ?',
        ['customer@sakan.com']
      );
      
      if (testCustomer.length === 0) {
        // Create test customer only
        const [result] = await db.query(
          `INSERT INTO customers (name, email, password, phone, address, role, status, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            'عميل تجريبي',
            'customer@sakan.com',
            hashedPassword,
            '01123456789',
            'القاهرة، مصر',
            'manager',
            'active'
          ]
        );
        console.log('✅ Test customer created:', result.insertId);
      }
      
      console.log('\n📧 Login Credentials:');
      console.log('Admin - Email: admin@sakan.com, Password: 123456');
      console.log('Customer - Email: customer@sakan.com, Password: 123456');
      return;
    }

    // Create admin customer
    const [adminResult] = await db.query(
      `INSERT INTO customers (name, email, password, phone, address, role, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        'مدير النظام',
        'admin@sakan.com',
        hashedPassword,
        '01234567890',
        'القاهرة، مصر',
        'admin',
        'active'
      ]
    );

    // Create test customer
    const [customerResult] = await db.query(
      `INSERT INTO customers (name, email, password, phone, address, role, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        'عميل تجريبي',
        'customer@sakan.com',
        hashedPassword,
        '01123456789',
        'الجيزة، مصر',
        'manager',
        'active'
      ]
    );

    console.log('✅ Admin user created successfully! ID:', adminResult.insertId);
    console.log('✅ Test customer created successfully! ID:', customerResult.insertId);
    console.log('\n📧 Login Credentials:');
    console.log('Admin - Email: admin@sakan.com, Password: 123456');
    console.log('Customer - Email: customer@sakan.com, Password: 123456');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  } finally {
    process.exit(0);
  }
}

createTestUser();