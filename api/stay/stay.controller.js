const stayService = require('./stay.service');
const logger = require('../../services/logger.service');

async function getStay(req, res) {
  try {
    const stay = await stayService.getById(req.params.id);
    res.send(stay);
  } catch (err) {
    logger.error('Failed to get Stay', err);
    res.status(500).send({ err: 'Failed to get Stay' });
  }
}

async function getStays(req, res) {
  try {
    var { filterBy } = req.query;
    console.log(
        '🚀 ~ file: stay.controller.js ~ line 17 ~ getStays ~ filterBy',
        filterBy
    );
    // res.json(JSON.parse(filterBy));
    // return;
    // return res.send(filterBy);
    filterBy = JSON.parse(filterBy);
    const stays = await stayService.query(filterBy);
    res.send(stays);
  } catch (err) {
    logger.error('Failed to get Stays', err);
    console.log('🚀 ~ file: stay.controller.js ~ line 23 ~ getStays ~ err', err);
    res.status(500).send({ err: 'Failed to get Stays' });
  }
}

async function deleteStay(req, res) {
  try {
    await stayService.remove(req.params.id);
    res.send({ msg: 'Deleted successfully' });
  } catch (err) {
    logger.error('Failed to delete Stay', err);
    res.status(500).send({ err: 'Failed to delete Stay' });
  }
}

async function updateStay(req, res) {
  try {
    const stay = req.body;
    const id = stay._id;
    console.log('id:', id);
    const savedStay = await stayService.update(stay, id);
    res.send(savedStay);
  } catch (err) {
    logger.error('Failed to update Stay', err);
    res.status(500).send({ err: 'Failed to update Stay' });
  }
}

async function addStay(req, res) {
  try {
    const Stay = req.body;
    const savedStay = await stayService.add(Stay);
    res.send(savedStay);
  } catch (err) {
    logger.error('Failed to update Stay', err);
    res.status(500).send({ err: 'Failed to update Stay' });
  }
}

module.exports = {
  getStay,
  getStays,
  deleteStay,
  updateStay,
  addStay,
};
