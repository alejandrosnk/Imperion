const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

async function requireAuth(req, res, next) {
  // 1) Intenta cookie httpOnly
  const cookieToken = req.cookies?.session_token;
  // 2) Fallback: Authorization: Bearer
  const header = req.headers['authorization'];
  const headerToken = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  const token = cookieToken || headerToken;
  if (!token) return res.status(401).json({ message: 'No autenticado' });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }

  // valida la sesión en base de datos
  const s = await pool.query(
    'SELECT 1 FROM sessions WHERE token=$1 AND expires_at > NOW() LIMIT 1',
    [token]
  );
  if (s.rows.length === 0) return res.status(401).json({ message: 'Sesión expirada o inexistente' });

  req.user = { id: decoded.id, role: decoded.role };
  req.token = token;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
