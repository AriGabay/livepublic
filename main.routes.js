const express = require('express');
const router = express.Router();

const authRoutes = require('./api/auth/auth.routes');
const userRoutes = require('./api/user/user.routes');
const stayRoutes = require('./api/stay/stay.routes');
const orderRoutes = require('./api/order/order.routes');

router.get('/', (req, res) => {
    res.send('working...');
});

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/stay', stayRoutes);
router.use('/order', orderRoutes);

module.exports = router;
