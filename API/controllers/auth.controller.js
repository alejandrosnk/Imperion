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

    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    const token = jwt.sign(tokenPayload(user), JWT_SECRET, { expiresIn: '1h' });

    // guarda la sesión
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1,$2,$3)',
      [user.id, token, expiresAt]
    );

    // Cookie httpOnly 
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      maxAge: TOKEN_TTL_MS,
      path: '/',
    });

    res.json({
      user: { id: user.id, email: user.email, role: user.role, fullname: user.fullname },
      expiresAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function me(req, res) {
  try {
    const u = await pool.query('SELECT id,email,role,fullname FROM users WHERE id=$1', [req.user.id]);
    if (!u.rows[0]) return res.status(401).json({ message: 'Usuario no encontrado' });
    res.json({ user: u.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function logout(req, res) {
  try {
    if (req.token) {
      await pool.query('DELETE FROM sessions WHERE token=$1', [req.token]);
    }
    res.clearCookie('session_token', { path: '/' });
    res.json({ message: 'Logout exitoso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login, me, logout };
