const router = require('express').Router();
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const { getPaymentsHistory, addPayment } = require('../controllers/payment.controller');

// Historial de pagos (solo ADMIN)
router.get('/', requireAuth, getPaymentsHistory);

// Registrar pago (mesero o admin)
router.post('/', requireAuth, addPayment);

module.exports = router;
