const pool = require('../config/db');

function normalizeType(t) {
  if (!t) return null;
  const v = String(t).toUpperCase();
  return v === 'DISH' || v === 'DRINK' ? v : null;
}

// GET /api/menu?type=DISH|DRINK&active=true|false&q=texto
exports.listMenu = async (req, res) => {
  try {
    const { type, active, q } = req.query;

    const where = [];
    const params = [];
    let idx = 1;

    const t = normalizeType(type);
    if (t) { where.push(`type = $${idx++}`); params.push(t); }

    if (active === 'true')  { where.push(`active = $${idx++}`); params.push(true); }
    if (active === 'false') { where.push(`active = $${idx++}`); params.push(false); }

    if (q && q.trim()) {
      where.push(`unaccent(lower(name)) LIKE unaccent(lower($${idx++}))`);
      params.push(`%${q.trim()}%`);
    }

    const sql = `
      SELECT id, name, type, price, active, created_at
      FROM menu_item
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY created_at DESC, id DESC
      LIMIT 200
    `;
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/menu/:id
exports.getMenuById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, type, price, active, created_at FROM menu_item WHERE id=$1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/menu  (ADMIN)
exports.createMenu = async (req, res) => {
  try {
    const { name, type, price, active } = req.body;

    const t = normalizeType(type);
    if (!name || !t || typeof price !== 'number') {
      return res.status(400).json({ message: 'name, type(DISH|DRINK) y price son obligatorios' });
    }
    if (price < 0) return res.status(400).json({ message: 'price no puede ser negativo' });

    const { rows } = await pool.query(
      `INSERT INTO menu_item (name, type, price, active)
       VALUES ($1,$2,$3,COALESCE($4, TRUE))
       RETURNING id, name, type, price, active, created_at`,
      [name.trim(), t, price, typeof active === 'boolean' ? active : null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/menu/:id  (ADMIN)
exports.updateMenu = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const { name, type, price, active } = req.body;

    // Construcción dinámica
    const sets = [];
    const params = [];
    let idx = 1;

    if (name !== undefined) { sets.push(`name=$${idx++}`); params.push(String(name).trim()); }
    if (type !== undefined) {
      const t = normalizeType(type);
      if (!t) return res.status(400).json({ message: 'type debe ser DISH o DRINK' });
      sets.push(`type=$${idx++}`); params.push(t);
    }
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ message: 'price debe ser número >= 0' });
      }
      sets.push(`price=$${idx++}`); params.push(price);
    }
    if (active !== undefined) {
      if (typeof active !== 'boolean') return res.status(400).json({ message: 'active debe ser boolean' });
      sets.push(`active=$${idx++}`); params.push(active);
    }

    if (sets.length === 0) return res.status(400).json({ message: 'Nada para actualizar' });

    params.push(id);
    const sql = `
      UPDATE menu_item
      SET ${sets.join(', ')}
      WHERE id=$${idx}
      RETURNING id, name, type, price, active, created_at
    `;
    const { rows } = await pool.query(sql, params);
    if (!rows[0]) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/menu/:id  (ADMIN)  -> soft delete (active=false)
exports.deleteMenu = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const { rows } = await pool.query(
      `UPDATE menu_item SET active=false WHERE id=$1
       RETURNING id, name, type, price, active, created_at`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto inactivado', item: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};