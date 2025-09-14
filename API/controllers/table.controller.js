const pool = require('../config/db');

// Listar todas las mesas
async function getTables(req, res) {
  try {
    const r = await pool.query('SELECT * FROM tables ORDER BY id');
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Listar solo mesas libres
async function getFreeTables(req, res) {
  try {
    const r = await pool.query("SELECT * FROM tables WHERE status = 'FREE' ORDER BY id");
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Crear nueva mesa (solo admin)
async function createTable(req, res) {
  const { code } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO tables (code, status) VALUES ($1, $2) RETURNING *',
      [code, 'FREE']
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Cambiar estado de mesa manualmente
async function updateTableStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const r = await pool.query(
      'UPDATE tables SET status=$1 WHERE id=$2 RETURNING *',
      [status, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ message: 'Mesa no encontrada' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getTables, getFreeTables, createTable, updateTableStatus };
