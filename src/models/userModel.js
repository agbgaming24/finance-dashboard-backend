import pool from '../config/db.js';

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, password, role = 'viewer' }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return result.insertId;
  },

  async findAll({ page, limit, offset, status, role }) {
    let where = 'WHERE 1=1';
    const params = [];

    if (status) { where += ' AND status = ?'; params.push(status); }
    if (role)   { where += ' AND role = ?';   params.push(role); }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users ${where}`, params);
    const [rows] = await pool.query(
      `SELECT id, name, email, role, status, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return { rows, total };
  },

  async update(id, fields) {
    const allowed = ['name', 'role', 'status'];
    const updates = Object.entries(fields).filter(([k]) => allowed.includes(k));
    if (updates.length === 0) return false;

    const setClauses = updates.map(([k]) => `${k} = ?`).join(', ');
    const values = updates.map(([, v]) => v);
    await pool.query(`UPDATE users SET ${setClauses} WHERE id = ?`, [...values, id]);
    return true;
  },

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  },
};

export default UserModel;
