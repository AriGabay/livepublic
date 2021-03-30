const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
const ObjectId = require('mongodb').ObjectId;
const ORDER_COLLECTION = 'order';

module.exports = {
    query,
    getById,
    remove,
    update,
    add,
};

async function query(filterBy) {
    try {
        var aggregation = _buildCriteria(filterBy);
        // return aggregation;

        if (
            filterBy.hasOwnProperty('page') &&
            filterBy.hasOwnProperty('size')
        ) {
            var { page, size } = filterBy;
            page = !isNaN(page) && page >= 0 ? page : 0;
            size = !isNaN(size) && size >= 0 ? size : 1;
            aggregation.push({ $skip: page * size });
            aggregation.push({ $limit: size });
        }
        // console.log('aggregation---27', JSON.stringify(aggregation));
        const collection = await dbService.getCollection(ORDER_COLLECTION);
        var orders = await collection.aggregate(aggregation).toArray();

        orders = orders.map((order) => {
            order.createdAt = ObjectId(order._id).getTimestamp();
            return order;
        });

        return orders;
    } catch (err) {
        logger.error('cannot find orders', err);
        throw err;
    }
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection(ORDER_COLLECTION);
        const order = await collection.findOne({ _id: ObjectId(orderId) });
        return order;
    } catch (err) {
        logger.error(`while finding order ${orderId}`, err);
        throw err;
    }
}

async function remove(orderId) {
    try {
        const collection = await dbService.getCollection(ORDER_COLLECTION);
        await collection.deleteOne({ _id: ObjectId(orderId) });
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err);
        throw err;
    }
}

async function update(order, id) {
    try {
        const _id = ObjectId(id);
        delete order._id;
        const collection = await dbService.getCollection(ORDER_COLLECTION);
        const updatedOrder = await collection.findOneAndUpdate(
            { _id },
            { $set: order },
            { returnOriginal: false }
        );
        return updatedOrder.value;
    } catch (err) {
        logger.error(`cannot update order ${order._id}`, err);
        console.error(`cannot update order ${order._id}`, err);
        throw err;
    }
}

async function add(order) {
    try {
        const collection = await dbService.getCollection(ORDER_COLLECTION);
        await collection.insertOne(order);
        return order;
    } catch (err) {
        logger.error('cannot insert order', err);
        throw err;
    }
}

function _buildCriteria(criteria) {
    const { checkIn, checkOut, guestCount, stayId, hostId, guestId } = criteria;

    var filterBy = {
        checkIn,
        checkOut,
        guestCount,
        stayId,
        hostId,
        guestId,
    };

    // console.log('🚀 ~ file: order.service.js ~ line 120 ~ _buildCriteria ~ filterBy', filterBy);

    for (const key in filterBy) {
        if (
            filterBy[key] === undefined ||
            filterBy[key] === null ||
            filterBy[key] === ''
        ) {
            delete filterBy[key];
        }
    }

    const aggregation = [];

    for (const key in filterBy) {
        const value = filterBy[key];
        // console.log(key, value);

        if (key === 'checkIn' && value) {
            aggregation.push({
                $match: {
                    checkIn: { $gte: new Date(checkIn) },
                },
            });
        }
        if (key === 'checkOut' && value) {
            aggregation.push({
                $match: {
                    checkOut: { $lte: new Date(checkOut) },
                },
            });
        }
        if (key === 'guestCount' && value) {
            aggregation.push({
                $match: {
                    guests: value,
                },
            });
        }
        if (key === 'stayId' && value) {
            aggregation.push({
                $match: {
                    'stay._id': value,
                },
            });
        }

        if (filterBy.hostId !== filterBy.guestId) {
            if (key === 'hostId' && value) {
                aggregation.push({
                    $match: {
                        'host._id': value,
                    },
                });
            }
            if (key === 'guestId' && value) {
                aggregation.push({
                    $match: {
                        'buyer._id': guestId,
                    },
                });
            }
        }
    }

    if (filterBy.hostId === filterBy.guestId) {
        const { hostId } = filterBy;
        aggregation.push({
            $match: {
                $or: [{ 'host._id': hostId }, { 'buyer._id': hostId }],
            },
        });
    }

    // console.log(
    //   'criteria:',
    //   JSON.stringify(criteria, null, 2),
    //   'filterBy:',
    //   JSON.stringify(filterBy, null, 2),
    //   'aggregation:',
    //   JSON.stringify(aggregation, null, 2)
    // );

    return aggregation;
}

var sample_filter = {
    checkIn: new Date(),
    checkOut: new Date(),
    guestCount: 1,
    stayId: null,
    hostId: null,
    guestId: null,
};
