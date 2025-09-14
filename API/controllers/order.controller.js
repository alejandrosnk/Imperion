const pool = require('../config/db');

// Crear nuevo pedido (solo mesero)
async function createOrder(req, res) {
  const { table_id } = req.body;
  const waiter_id = req.user.id;

  try {
    // Verificar que la mesa esté libre
    const mesa = await pool.query("SELECT * FROM tables WHERE id=$1 AND status='FREE'", [table_id]);
    if (mesa.rows.length === 0) {
      return res.status(400).json({ message: 'La mesa no está disponible' });
    }

    // Crear pedido
    const r = await pool.query(
      `INSERT INTO orders (waiter_id, table_id, status) 
       VALUES ($1, $2, 'OPEN') RETURNING *`,
      [waiter_id, table_id]
    );

    // Cambiar mesa a OCCUPIED
    await pool.query("UPDATE tables SET status='OCCUPIED' WHERE id=$1", [table_id]);

    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Listar pedidos (admin ve todos, mesero solo los suyos)
async function getOrders(req, res) {
  try {
    let r;
    if (req.user.role === 'ADMIN') {
      r = await pool.query(`
        SELECT o.*, u.fullname AS waiter, t.code AS table_code
        FROM orders o
        JOIN users u ON u.id=o.waiter_id
        JOIN tables t ON t.id=o.table_id
        ORDER BY o.created_at DESC
      `);
    } else {
      r = await pool.query(`
        SELECT o.*, u.fullname AS waiter, t.code AS table_code
        FROM orders o
        JOIN users u ON u.id=o.waiter_id
        JOIN tables t ON t.id=o.table_id
        WHERE o.waiter_id=$1
        ORDER BY o.created_at DESC
      `, [req.user.id]);
    }
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Agregar ítem al pedido
async function addItem(req, res) {
  const { id } = req.params; // id del pedido
  const { menu_item_id, qty, unit_price } = req.body;

  try {
    // Validar pedido abierto
    const pedido = await pool.query("SELECT * FROM orders WHERE id=$1 AND status='OPEN'", [id]);
    if (pedido.rows.length === 0) return res.status(400).json({ message: 'Pedido no disponible' });

    const r = await pool.query(
      `INSERT INTO order_item (order_id, menu_item_id, qty, unit_price)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, menu_item_id, qty, unit_price]
    );

    const item = {
      ...r.rows[0],
      unit_price: parseFloat(r.rows[0].unit_price),
      total: parseFloat(r.rows[0].total)
    };

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Cerrar pedido (cambia mesa a CLEANING)
async function closeOrder(req, res) {
  const { id } = req.params;

  try {
    const pedido = await pool.query("SELECT * FROM orders WHERE id=$1", [id]);
    if (pedido.rows.length === 0) return res.status(404).json({ message: 'Pedido no encontrado' });

    // Marcar pedido como pagado/cerrado
    await pool.query(
      "UPDATE orders SET status='PAID', closed_at=NOW() WHERE id=$1",
      [id]
    );

    // Mesa pasa a CLEANING
    await pool.query("UPDATE tables SET status='CLEANING' WHERE id=$1", [pedido.rows[0].table_id]);

    res.json({ message: 'Pedido cerrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Obtener detalle de un pedido (ADMIN o dueño del pedido)
async function getOrderById(req, res) {
  const { id } = req.params;

  try {
    const pedido = await pool.query(`
      SELECT o.*, u.fullname AS waiter, t.code AS table_code
      FROM orders o
      JOIN users u ON u.id=o.waiter_id
      JOIN tables t ON t.id=o.table_id
      WHERE o.id=$1
    `, [id]);

    if (pedido.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const items = await pool.query(`
      SELECT oi.*, m.name AS menu_name, m.type
      FROM order_item oi
      JOIN menu_item m ON m.id=oi.menu_item_id
      WHERE oi.order_id=$1
    `, [id]);

    const itemsParsed = items.rows.map(i => ({
      ...i,
      unit_price: parseFloat(i.unit_price),
      total: parseFloat(i.total),
    }));

    res.json({
      ...pedido.rows[0],
      items: itemsParsed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOpenOrderByTable(req, res) {
  const { table_id } = req.params;

  try {
    const r = await pool.query(
      `SELECT * FROM orders WHERE table_id=$1 AND status='OPEN' LIMIT 1`,
      [table_id]
    );

    if (r.rows.length === 0) {
      return res.json(null);
    }

    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createOrder, getOrders, addItem, closeOrder, getOrderById, getOpenOrderByTable};
