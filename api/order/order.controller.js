const orderService = require('./order.service');
const logger = require('../../services/logger.service');

async function getOrder(req, res) {
    try {
        const order = await orderService.getById(req.params.id);
        res.send(order);
    } catch (err) {
        logger.error('Failed to get order', err);
        res.status(500).send({ err: 'Failed to get order' });
    }
}

async function getOrders(req, res) {
    try {
        var { filterBy } = req.query;
        if (!filterBy) return res.status(400).send({ err: 'filterBy invalid' });

        filterBy = JSON.parse(filterBy);
        const orders = await orderService.query(filterBy);
        res.send(orders);
    } catch (err) {
        logger.error('Failed to get orders', err);
        console.log(
            '🚀 ~ file: order.controller.js ~ line 23 ~ getorders ~ err',
            err
        );
        res.status(500).send({ err: 'Failed to get orders' });
    }
}

async function deleteOrder(req, res) {
    try {
        await orderService.remove(req.params.id);
        res.send({ msg: 'Deleted successfully' });
    } catch (err) {
        logger.error('Failed to delete order', err);
        res.status(500).send({ err: 'Failed to delete order' });
    }
}

async function updateOrder(req, res) {
    try {
        const order = req.body;
        const id = order._id;
        console.log('id:', id);
        const savedOrder = await orderService.update(order, id);
        console.log(
            '🚀 ~ file: order.controller.js ~ line 45 ~ updateOrder ~ savedOrder',
            savedOrder
        );
        res.send(savedOrder);
    } catch (err) {
        logger.error('Failed to update order', err);
        res.status(500).send({ err: 'Failed to update order' });
    }
}

async function addOrder(req, res) {
    try {
        const order = req.body;
        const savedOrder = await orderService.add(order);
        res.send(savedOrder);
    } catch (err) {
        logger.error('Failed to update order', err);
        res.status(500).send({ err: 'Failed to update order' });
    }
}

module.exports = {
    getOrder,
    getOrders,
    deleteOrder,
    updateOrder,
    addOrder,
};
