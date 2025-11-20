const db = require('../config/database');

/**
 * Get all units for current customer (with optional building filter)
 */
const getAll = async (req, res) => {
  const customerId = req.user.id;
  const { building_id } = req.query;

  let query = `
    SELECT u.*, b.name as building_name, b.address as building_address
    FROM units u
    JOIN buildings b ON u.building_id = b.id
    WHERE b.customer_id = ?
  `;
  
  const params = [customerId];

  if (building_id) {
    query += ' AND u.building_id = ?';
    params.push(building_id);
  }

  query += ' ORDER BY b.name, u.floor_number, u.unit_number';

  const [units] = await db.query(query, params);

  res.json({
    success: true,
    data: units
  });
};

/**
 * Get single unit by ID
 */
const getById = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  const [units] = await db.query(
    `SELECT u.*, b.name as building_name, b.address as building_address
     FROM units u
     JOIN buildings b ON u.building_id = b.id
     WHERE u.id = ? AND b.customer_id = ?`,
    [id, customerId]
  );

  if (units.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'الوحدة غير موجودة'
    });
  }

  res.json({
    success: true,
    data: units[0]
  });
};

/**
 * Create new unit
 */
const create = async (req, res) => {
  const customerId = req.user.id;
  const {
    building_id,
    unit_number,
    floor_number,
    bedrooms,
    bathrooms,
    area,
    rent_amount,
    status,
    description
  } = req.body;

  // Validate required fields
  if (!building_id || !unit_number) {
    return res.status(400).json({
      success: false,
      message: 'المبنى ورقم الوحدة مطلوبان'
    });
  }

  // Verify building belongs to customer
  const [buildings] = await db.query(
    'SELECT id FROM buildings WHERE id = ? AND customer_id = ?',
    [building_id, customerId]
  );

  if (buildings.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'المبنى غير موجود'
    });
  }

  // Check if unit number already exists in building
  const [existing] = await db.query(
    'SELECT id FROM units WHERE building_id = ? AND unit_number = ?',
    [building_id, unit_number]
  );

  if (existing.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'رقم الوحدة موجود بالفعل في هذا المبنى'
    });
  }

  const [result] = await db.query(
    `INSERT INTO units 
     (building_id, unit_number, floor_number, bedrooms, bathrooms, area, rent_amount, status, description, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [building_id, unit_number, floor_number || 1, bedrooms || 0, bathrooms || 0, area, rent_amount, status || 'available', description]
  );

  res.status(201).json({
    success: true,
    message: 'تم إضافة الوحدة بنجاح',
    data: {
      id: result.insertId,
      unit_number,
      building_id
    }
  });
};

/**
 * Update unit
 */
const update = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  const {
    unit_number,
    floor_number,
    bedrooms,
    bathrooms,
    area,
    rent_amount,
    status,
    description
  } = req.body;

  // Verify unit belongs to customer
  const [units] = await db.query(
    `SELECT u.id 
     FROM units u
     JOIN buildings b ON u.building_id = b.id
     WHERE u.id = ? AND b.customer_id = ?`,
    [id, customerId]
  );

  if (units.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'الوحدة غير موجودة'
    });
  }

  const updates = [];
  const values = [];

  if (unit_number) {
    updates.push('unit_number = ?');
    values.push(unit_number);
  }
  if (floor_number !== undefined) {
    updates.push('floor_number = ?');
    values.push(floor_number);
  }
  if (bedrooms !== undefined) {
    updates.push('bedrooms = ?');
    values.push(bedrooms);
  }
  if (bathrooms !== undefined) {
    updates.push('bathrooms = ?');
    values.push(bathrooms);
  }
  if (area !== undefined) {
    updates.push('area = ?');
    values.push(area);
  }
  if (rent_amount !== undefined) {
    updates.push('rent_amount = ?');
    values.push(rent_amount);
  }
  if (status) {
    updates.push('status = ?');
    values.push(status);
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

  values.push(id);

  await db.query(
    `UPDATE units SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  res.json({
    success: true,
    message: 'تم تحديث الوحدة بنجاح'
  });
};

/**
 * Delete unit
 */
const deleteUnit = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  // Verify unit belongs to customer
  const [units] = await db.query(
    `SELECT u.id 
     FROM units u
     JOIN buildings b ON u.building_id = b.id
     WHERE u.id = ? AND b.customer_id = ?`,
    [id, customerId]
  );

  if (units.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'الوحدة غير موجودة'
    });
  }

  // Check if unit has tenants
  const [tenants] = await db.query(
    'SELECT COUNT(*) as count FROM tenants WHERE unit_id = ?',
    [id]
  );

  if (tenants[0].count > 0) {
    return res.status(400).json({
      success: false,
      message: 'لا يمكن حذف الوحدة لأنها تحتوي على مستأجرين'
    });
  }

  await db.query('DELETE FROM units WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'تم حذف الوحدة بنجاح'
  });
};

/**
 * Get unit tenants history
 */
const getTenantsHistory = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  // Verify unit belongs to customer
  const [units] = await db.query(
    `SELECT u.id 
     FROM units u
     JOIN buildings b ON u.building_id = b.id
     WHERE u.id = ? AND b.customer_id = ?`,
    [id, customerId]
  );

  if (units.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'الوحدة غير موجودة'
    });
  }

  const [tenants] = await db.query(
    `SELECT * FROM tenants 
     WHERE unit_id = ? 
     ORDER BY start_date DESC`,
    [id]
  );

  res.json({
    success: true,
    data: tenants
  });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteUnit,
  getTenantsHistory
};
