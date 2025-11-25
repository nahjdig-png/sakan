const db = require('../config/database');

/**
 * Get all buildings for current customer
 */
const getAll = async (req, res) => {
  const customerId = req.user.id;

  const [buildings] = await db.query(
    `SELECT b.*, 
     (SELECT COUNT(*) FROM units WHERE building_id = b.id) as total_units,
     (SELECT COUNT(*) FROM units WHERE building_id = b.id AND status = 'occupied') as occupied_units,
     (SELECT COUNT(*) FROM units WHERE building_id = b.id AND status = 'available') as available_units
     FROM buildings b
     WHERE b.customer_id = ?
     ORDER BY b.created_at DESC`,
    [customerId]
  );

  res.json({
    success: true,
    data: buildings
  });
};

/**
 * Get single building by ID
 */
const getById = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  const [buildings] = await db.query(
    `SELECT b.*, 
     (SELECT COUNT(*) FROM units WHERE building_id = b.id) as total_units,
     (SELECT COUNT(*) FROM units WHERE building_id = b.id AND status = 'occupied') as occupied_units,
     (SELECT COUNT(*) FROM units WHERE building_id = b.id AND status = 'available') as available_units
     FROM buildings b
     WHERE b.id = ? AND b.customer_id = ?`,
    [id, customerId]
  );

  if (buildings.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'المبنى غير موجود'
    });
  }

  res.json({
    success: true,
    data: buildings[0]
  });
};

/**
 * Create new building
 */
const create = async (req, res) => {
  const customerId = req.user.id;
  const { 
    name, 
    address, 
    city, 
    floors_count, 
    units_per_floor, 
    description 
  } = req.body;

  // Validate required fields
  if (!name || !address || !city) {
    return res.status(400).json({
      success: false,
      message: 'اسم المبنى والعنوان والمدينة مطلوبة'
    });
  }

  const [result] = await db.query(
    `INSERT INTO buildings 
     (customer_id, name, address, city, floors_count, units_per_floor, description, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [customerId, name, address, city, floors_count || 0, units_per_floor || 0, description]
  );

  res.status(201).json({
    success: true,
    message: 'تم إضافة المبنى بنجاح',
    data: {
      id: result.insertId,
      name,
      address,
      city
    }
  });
};

/**
 * Update building
 */
const update = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  const { 
    name, 
    address, 
    city, 
    floors_count, 
    units_per_floor, 
    description 
  } = req.body;

  // Check if building exists and belongs to customer
  const [existing] = await db.query(
    'SELECT id FROM buildings WHERE id = ? AND customer_id = ?',
    [id, customerId]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'المبنى غير موجود'
    });
  }

  const updates = [];
  const values = [];

  if (name) {
    updates.push('name = ?');
    values.push(name);
  }
  if (address) {
    updates.push('address = ?');
    values.push(address);
  }
  if (city) {
    updates.push('city = ?');
    values.push(city);
  }
  if (floors_count !== undefined) {
    updates.push('floors_count = ?');
    values.push(floors_count);
  }
  if (units_per_floor !== undefined) {
    updates.push('units_per_floor = ?');
    values.push(units_per_floor);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'لا توجد بيانات للتحديث'
    });
  }

  values.push(id, customerId);

  await db.query(
    `UPDATE buildings SET ${updates.join(', ')} WHERE id = ? AND customer_id = ?`,
    values
  );

  res.json({
    success: true,
    message: 'تم تحديث المبنى بنجاح'
  });
};

/**
 * Delete building
 */
const deleteBuilding = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  // Check if building exists and belongs to customer
  const [existing] = await db.query(
    'SELECT id FROM buildings WHERE id = ? AND customer_id = ?',
    [id, customerId]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'المبنى غير موجود'
    });
  }

  // Check if building has units
  const [units] = await db.query(
    'SELECT COUNT(*) as count FROM units WHERE building_id = ?',
    [id]
  );

  if (units[0].count > 0) {
    return res.status(400).json({
      success: false,
      message: 'لا يمكن حذف المبنى لأنه يحتوي على وحدات'
    });
  }

  await db.query(
    'DELETE FROM buildings WHERE id = ? AND customer_id = ?',
    [id, customerId]
  );

  res.json({
    success: true,
    message: 'تم حذف المبنى بنجاح'
  });
};

/**
 * Get building statistics
 */
const getStats = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  // Check if building exists and belongs to customer
  const [buildings] = await db.query(
    'SELECT id FROM buildings WHERE id = ? AND customer_id = ?',
    [id, customerId]
  );

  if (buildings.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'المبنى غير موجود'
    });
  }

  // Get statistics
  const [stats] = await db.query(
    `SELECT 
     COUNT(*) as total_units,
     SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_units,
     SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_units,
     SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_units,
     SUM(rent_amount) as total_rent,
     AVG(rent_amount) as average_rent
     FROM units
     WHERE building_id = ?`,
    [id]
  );

  // Get recent invoices
  const [recentInvoices] = await db.query(
    `SELECT si.*, u.unit_number, u.floor_number
     FROM service_invoices si
     JOIN units u ON si.unit_id = u.id
     WHERE u.building_id = ?
     ORDER BY si.issue_date DESC
     LIMIT 10`,
    [id]
  );

  res.json({
    success: true,
    data: {
      stats: stats[0],
      recentInvoices
    }
  });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteBuilding,
  getStats
};
