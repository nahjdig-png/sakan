const db = require('../config/database');

/**
 * Get all invoices for current customer (with filters)
 */
const getAll = async (req, res) => {
  const customerId = req.user.id;
  const { building_id, unit_id, status, start_date, end_date } = req.query;

  let query = `
    SELECT si.*, u.unit_number, u.floor_number, b.name as building_name
    FROM service_invoices si
    JOIN units u ON si.unit_id = u.id
    JOIN buildings b ON u.building_id = b.id
    WHERE b.customer_id = ?
  `;
  
  const params = [customerId];

  if (building_id) {
    query += ' AND u.building_id = ?';
    params.push(building_id);
  }

  if (unit_id) {
    query += ' AND si.unit_id = ?';
    params.push(unit_id);
  }

  if (status) {
    query += ' AND si.status = ?';
    params.push(status);
  }

  if (start_date) {
    query += ' AND si.issue_date >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND si.issue_date <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY si.issue_date DESC';

  const [invoices] = await db.query(query, params);

  res.json({
    success: true,
    data: invoices
  });
};

/**
 * Get single invoice by ID
 */
const getById = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  const [invoices] = await db.query(
    `SELECT si.*, u.unit_number, u.floor_number, b.name as building_name
     FROM service_invoices si
     JOIN units u ON si.unit_id = u.id
     JOIN buildings b ON u.building_id = b.id
     WHERE si.id = ? AND b.customer_id = ?`,
    [id, customerId]
  );

  if (invoices.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'الفاتورة غير موجودة'
    });
  }

  res.json({
    success: true,
    data: invoices[0]
  });
};

/**
 * Create new invoice
 */
const create = async (req, res) => {
  const customerId = req.user.id;
  const {
    unit_id,
    service_type,
    amount,
    issue_date,
    due_date,
    description,
    status
  } = req.body;

  // Validate required fields
  if (!unit_id || !service_type || !amount || !issue_date) {
    return res.status(400).json({
      success: false,
      message: 'الوحدة ونوع الخدمة والمبلغ وتاريخ الإصدار مطلوبة'
    });
  }

  // Verify unit belongs to customer
  const [units] = await db.query(
    `SELECT u.id 
     FROM units u
     JOIN buildings b ON u.building_id = b.id
     WHERE u.id = ? AND b.customer_id = ?`,
    [unit_id, customerId]
  );

  if (units.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'الوحدة غير موجودة'
    });
  }

  const [result] = await db.query(
    `INSERT INTO service_invoices 
     (unit_id, service_type, amount, issue_date, due_date, description, status, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [unit_id, service_type, amount, issue_date, due_date, description, status || 'unpaid']
  );

  res.status(201).json({
    success: true,
    message: 'تم إضافة الفاتورة بنجاح',
    data: {
      id: result.insertId,
      unit_id,
      service_type,
      amount
    }
  });
};

/**
 * Update invoice
 */
const update = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  const {
    service_type,
    amount,
    issue_date,
    due_date,
    description,
    status
  } = req.body;

  // Verify invoice belongs to customer
  const [invoices] = await db.query(
    `SELECT si.id 
     FROM service_invoices si
     JOIN units u ON si.unit_id = u.id
     JOIN buildings b ON u.building_id = b.id
     WHERE si.id = ? AND b.customer_id = ?`,
    [id, customerId]
  );

  if (invoices.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'الفاتورة غير موجودة'
    });
  }

  const updates = [];
  const values = [];

  if (service_type) {
    updates.push('service_type = ?');
    values.push(service_type);
  }
  if (amount !== undefined) {
    updates.push('amount = ?');
    values.push(amount);
  }
  if (issue_date) {
    updates.push('issue_date = ?');
    values.push(issue_date);
  }
  if (due_date) {
    updates.push('due_date = ?');
    values.push(due_date);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (status) {
    updates.push('status = ?');
    values.push(status);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'لا توجد بيانات للتحديث'
    });
  }

  values.push(id);

  await db.query(
    `UPDATE service_invoices SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  res.json({
    success: true,
    message: 'تم تحديث الفاتورة بنجاح'
  });
};

/**
 * Delete invoice
 */
const deleteInvoice = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  // Verify invoice belongs to customer
  const [invoices] = await db.query(
    `SELECT si.id 
     FROM service_invoices si
     JOIN units u ON si.unit_id = u.id
     JOIN buildings b ON u.building_id = b.id
     WHERE si.id = ? AND b.customer_id = ?`,
    [id, customerId]
  );

  if (invoices.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'الفاتورة غير موجودة'
    });
  }

  await db.query('DELETE FROM service_invoices WHERE id = ?', [id]);

  res.json({
    success: true,
    message: 'تم حذف الفاتورة بنجاح'
  });
};

/**
 * Mark invoice as paid
 */
const markAsPaid = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  const { payment_date, payment_method } = req.body;

  // Verify invoice belongs to customer
  const [invoices] = await db.query(
    `SELECT si.id 
     FROM service_invoices si
     JOIN units u ON si.unit_id = u.id
     JOIN buildings b ON u.building_id = b.id
     WHERE si.id = ? AND b.customer_id = ?`,
    [id, customerId]
  );

  if (invoices.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'الفاتورة غير موجودة'
    });
  }

  await db.query(
    `UPDATE service_invoices 
     SET status = 'paid', payment_date = ?, payment_method = ? 
     WHERE id = ?`,
    [payment_date || new Date(), payment_method || 'cash', id]
  );

  res.json({
    success: true,
    message: 'تم تحديث حالة الدفع بنجاح'
  });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteInvoice,
  markAsPaid
};
