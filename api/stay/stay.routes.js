const express = require('express');
// const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const { getStay, getStays, addStay, updateStay } = require('./stay.controller');
const router = express.Router();

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getStays);
router.get('/:id', getStay);
router.post('/', addStay);
router.put('/:id', updateStay);

module.exports = router;
