const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth.middleware');
const { createOrder, getOrders, addItem, closeOrder, getOrderById, getOpenOrderByTable} = require('../controllers/order.controller');

// Crear pedido (meseros)
router.post('/', requireAuth, createOrder);

// Ver pedidos (admin ve todos, mesero solo los suyos)
router.get('/', requireAuth, getOrders);

// Agregar ítem a pedido
router.post('/:id/items', requireAuth, addItem);

// Cerrar pedido
router.patch('/:id/close', requireAuth, closeOrder);

// Obtener detalle del pedido
router.get('/:id', requireAuth, getOrderById);

// Obtener pedido abierto de una mesa
router.get("/by-table/:table_id", requireAuth, getOpenOrderByTable);

module.exports = router;
