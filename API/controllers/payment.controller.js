const pool = require('../config/db');

// Registrar un pago parcial (puede ser por ciertos productos)
exports.addPayment = async (req, res) => {
  const { order_id, amount, method, items } = req.body;
  const paid_by = req.user.id;

  try {
    // validar pedido
    const pedido = await pool.query("SELECT * FROM orders WHERE id=$1", [order_id]);
    if (pedido.rows.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    if (pedido.rows[0].status !== "OPEN") {
      return res.status(400).json({ message: "El pedido ya no está abierto" });
    }

    // registrar pago
    const r = await pool.query(
      `INSERT INTO payment (order_id, amount, method, paid_by, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [order_id, amount, method.toUpperCase(), paid_by]
    );

    // si se mandaron ítems específicos, registrarlos en tabla intermedia
    if (items && Array.isArray(items) && items.length > 0) {
      for (const itemId of items) {
        await pool.query(
          `INSERT INTO payment_item (payment_id, order_item_id) VALUES ($1, $2)`,
          [r.rows[0].id, itemId]
        );
      }
    }

    // calcular total pagado
    const pagos = await pool.query(
      "SELECT COALESCE(SUM(amount),0) as total_pagado FROM payment WHERE order_id=$1",
      [order_id]
    );
    const total_pagado = parseFloat(pagos.rows[0].total_pagado);

    // calcular total del pedido
    const totalPedido = await pool.query(
      `SELECT COALESCE(SUM(qty * unit_price),0) as total
       FROM order_item WHERE order_id=$1`,
      [order_id]
    );
    const total = parseFloat(totalPedido.rows[0].total);

    // si ya se pagó todo → cerrar pedido y pasar mesa a limpieza
    if (total_pagado >= total) {
      await pool.query(
        "UPDATE orders SET status='PAID', closed_at=NOW() WHERE id=$1",
        [order_id]
      );
      await pool.query(
        "UPDATE tables SET status='CLEANING' WHERE id=$1",
        [pedido.rows[0].table_id]
      );
    }

    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Historial de pagos (solo admin)
exports.getPaymentsHistory = async (req, res) => {
  try {
    const { orderId, waiterId, from, to, method, page = 1, pageSize = 20 } = req.query;

    const where = [];
    const params = [];
    let idx = 1;

    if (orderId) { where.push(`p.order_id = $${idx++}`); params.push(Number(orderId)); }
    if (waiterId) { where.push(`p.paid_by = $${idx++}`); params.push(Number(waiterId)); }
    if (method) { where.push(`p.method = $${idx++}`); params.push(String(method).toUpperCase()); }
    if (from) { where.push(`p.created_at >= $${idx++}`); params.push(new Date(from)); }
    if (to) { where.push(`p.created_at < $${idx++}`); params.push(new Date(to)); }

    const base = `
      FROM payment p
      JOIN orders o ON o.id = p.order_id
      LEFT JOIN users u ON u.id = p.paid_by
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    `;

    const countSql = `SELECT COUNT(*) ${base}`;
    const countRes = await pool.query(countSql, params);
    const total = Number(countRes.rows[0].count || 0);

    const pg = Math.max(1, parseInt(page, 10));
    const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10)));
    const offset = (pg - 1) * ps;

    const sql = `
      SELECT
        p.id, p.order_id, p.amount, p.method, p.created_at,
        u.fullname AS paid_by_name,
        o.table_id, o.status AS order_status
      ${base}
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT ${ps} OFFSET ${offset}
    `;
    const { rows } = await pool.query(sql, params);

    res.json({ page: pg, pageSize: ps, total, rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
