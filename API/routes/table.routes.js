const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { getTables, getFreeTables, createTable, updateTableStatus } = require('../controllers/table.controller');

// Ver todas las mesas (ADMIN)
router.get('/', requireAuth, getTables);

// Ver mesas libres (para meseros y admin)
router.get('/free', requireAuth, getFreeTables);

// Crear mesa (solo ADMIN)
router.post('/', requireAuth, requireRole('ADMIN'), createTable);

// Cambiar estado mesa (ADMIN o mesero si libera mesa)
router.patch('/:id', requireAuth, updateTableStatus);

module.exports = router;
