const router = require('express').Router();
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/menu.controller');

// Lectura: ADMIN y WAITER
router.get('/', requireAuth, ctrl.listMenu);
router.get('/:id', requireAuth, ctrl.getMenuById);

// Escritura: sólo ADMIN
router.post('/', requireAuth, requireRole('ADMIN'), ctrl.createMenu);
router.put('/:id', requireAuth, requireRole('ADMIN'), ctrl.updateMenu);
router.delete('/:id', requireAuth, requireRole('ADMIN'), ctrl.deleteMenu);

module.exports = router;
