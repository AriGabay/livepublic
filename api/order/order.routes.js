const express = require('express');
// const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {
    getOrder,
    getOrders,
    addOrder,
    updateOrder,
} = require('./order.controller');
const router = express.Router();

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', addOrder);
router.put('/:id', updateOrder);

module.exports = router;
