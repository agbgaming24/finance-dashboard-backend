import pool from '../config/db.js';

const RecordModel = {
  async create({ user_id, amount, type, category, date, notes }) {
    const [result] = await pool.query(
      'INSERT INTO financial_records (user_id, amount, type, category, date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, amount, type, category, date, notes || null]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM financial_records WHERE id = ? AND is_deleted = 0',
      [id]
    );
    return rows[0] || null;
  },

  async findAll({ page, limit, offset, type, category, startDate, endDate, user_id }) {
    let where = 'WHERE r.is_deleted = 0';
    const params = [];

    if (type)      { where += ' AND r.type = ?';              params.push(type); }
    if (category)  { where += ' AND r.category LIKE ?';       params.push(`%${category}%`); }
    if (startDate) { where += ' AND r.date >= ?';             params.push(startDate); }
    if (endDate)   { where += ' AND r.date <= ?';             params.push(endDate); }
    if (user_id)   { where += ' AND r.user_id = ?';           params.push(user_id); }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM financial_records r ${where}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT r.*, u.name AS created_by_name
       FROM financial_records r
       JOIN users u ON r.user_id = u.id
       ${where}
       ORDER BY r.date DESC, r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  },

  async update(id, fields) {
    const allowed = ['amount', 'type', 'category', 'date', 'notes'];
    const updates = Object.entries(fields).filter(([k]) => allowed.includes(k) && fields[k] !== undefined);
    if (updates.length === 0) return false;

    const setClauses = updates.map(([k]) => `${k} = ?`).join(', ');
    const values = updates.map(([, v]) => v);
    await pool.query(`UPDATE financial_records SET ${setClauses} WHERE id = ?`, [...values, id]);
    return true;
  },

  // Soft delete
  async softDelete(id) {
    await pool.query('UPDATE financial_records SET is_deleted = 1 WHERE id = ?', [id]);
  },

  // --- Dashboard aggregation queries ---

  async getTotals({ startDate, endDate }) {
    let where = 'WHERE is_deleted = 0';
    const params = [];
    if (startDate) { where += ' AND date >= ?'; params.push(startDate); }
    if (endDate)   { where += ' AND date <= ?'; params.push(endDate); }

    const [rows] = await pool.query(
      `SELECT
        SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses,
        SUM(CASE WHEN type = 'income'  THEN amount ELSE -amount END) AS net_balance
       FROM financial_records ${where}`,
      params
    );
    return rows[0];
  },

  async getCategoryTotals({ type, startDate, endDate }) {
    let where = 'WHERE is_deleted = 0';
    const params = [];
    if (type)      { where += ' AND type = ?';   params.push(type); }
    if (startDate) { where += ' AND date >= ?';  params.push(startDate); }
    if (endDate)   { where += ' AND date <= ?';  params.push(endDate); }

    const [rows] = await pool.query(
      `SELECT category, type, SUM(amount) AS total, COUNT(*) AS count
       FROM financial_records ${where}
       GROUP BY category, type
       ORDER BY total DESC`,
      params
    );
    return rows;
  },

  async getMonthlyTrends({ year }) {
    const y = year || new Date().getFullYear();
    const [rows] = await pool.query(
      `SELECT
        DATE_FORMAT(date, '%Y-%m') AS month,
        SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses
       FROM financial_records
       WHERE is_deleted = 0 AND YEAR(date) = ?
       GROUP BY month
       ORDER BY month ASC`,
      [y]
    );
    return rows;
  },

  async getRecentActivity(limit = 10) {
    const [rows] = await pool.query(
      `SELECT r.id, r.amount, r.type, r.category, r.date, r.notes, u.name AS created_by
       FROM financial_records r
       JOIN users u ON r.user_id = u.id
       WHERE r.is_deleted = 0
       ORDER BY r.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },
};

export default RecordModel;
