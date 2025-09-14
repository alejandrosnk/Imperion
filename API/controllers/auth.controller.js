const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

function tokenPayload(user) {
  return { id: user.id, role: user.role };
}

async function register(req, res) {
  const { email, password, fullName, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query(
      'INSERT INTO users (email, password, fullname, role) VALUES ($1,$2,$3,$4) RETURNING id,email,role,fullname',
      [email, hash, fullName, role || 'WAITER']
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Email ya registrado' });
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = r.rows[0];
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(tokenPayload(user), JWT_SECRET, { expiresIn: '1h' });
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    res.json({
      user: { id: user.id, email: user.email, role: user.role, fullname: user.fullname },
      token,
      expiresAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function me(req, res) {
  const header = req.headers['authorization'];
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (!token) return res.status(401).json({ message: 'No autenticado' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const u = await pool.query('SELECT id,email,role,fullname FROM users WHERE id=$1', [decoded.id]);
    if (!u.rows[0]) return res.status(401).json({ message: 'Usuario no encontrado' });
    res.json({ user: u.rows[0] });
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

async function logout(_req, res) {
  res.json({ message: 'Logout OK' });
}

module.exports = { register, login, me, logout };
