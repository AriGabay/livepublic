const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
// const reviewService = require('../review/review.service');
const ObjectId = require('mongodb').ObjectId;
const USER_COLLECTION = 'user';

module.exports = {
    query,
    getById,
    getByUsername,
    remove,
    update,
    add,
};

async function query() {
    try {
        const collection = await dbService.getCollection(USER_COLLECTION);
        var users = await collection.find().toArray();
        users = users.map((user) => {
            user.createdAt = ObjectId(user._id).getTimestamp();
            delete user.password;
            return user;
        });
        return users;
    } catch (err) {
        logger.error('cannot find users', err);
        throw err;
    }
}

async function queryOld(filterBy = {}) {
    // return [{ notActive: true }];
    // const criteria = _buildCriteria(filterBy);
    try {
        const collection = await dbService.getCollection(USER_COLLECTION);
        var users = await collection.find(criteria).toArray();
        users = users.map((user) => {
            user.createdAt = ObjectId(user._id).getTimestamp();
            return user;
        });
        return users;
    } catch (err) {
        logger.error('cannot find users', err);
        throw err;
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection(USER_COLLECTION);
        const user = await collection.findOne({ _id: ObjectId(userId) });
        delete user.password;

        // user.givenReviews = await reviewService.query({
        //     byUserId: ObjectId(user._id),
        // });
        // user.givenReviews = user.givenReviews.map((review) => {
        //     delete review.byUser;
        //     return review;
        // });

        return user;
    } catch (err) {
        logger.error(`while finding user ${userId}`, err);
        throw err;
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection(USER_COLLECTION);
        const user = await collection.findOne({ username });
        return user;
    } catch (err) {
        logger.error(`while finding user ${username}`, err);
        throw err;
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection(USER_COLLECTION);
        await collection.deleteOne({ _id: ObjectId(userId) });
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err);
        throw err;
    }
}

async function update(user) {
    try {
        // peek only updatable fields!
        const _id = ObjectId(user._id);
        const userToSave = {
            username: user.username,
            fullname: user.fullname,
            password: user.password,
            imgUrl: user.imgUrl,
        };
        const collection = await dbService.getCollection(USER_COLLECTION);
        await collection.updateOne({ _id }, { $set: userToSave });
        return userToSave;
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err);
        throw err;
    }
}

async function add(user) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            imgUrl: user.imgUrl,
        };
        const collection = await dbService.getCollection(USER_COLLECTION);
        await collection.insertOne(userToAdd);
        return userToAdd;
    } catch (err) {
        logger.error('cannot insert user', err);
        throw err;
    }
}

function _buildCriteria(filterBy) {
    const criteria = {};
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' };
        criteria.$or = [
            {
                username: txtCriteria,
            },
            {
                fullname: txtCriteria,
            },
        ];
    }
    if (filterBy.minBalance) {
        criteria.balance = { $gte: filterBy.minBalance };
    }
    return criteria;
}
