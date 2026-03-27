const dareService = require('../services/dare.service');
const { sendSuccess, sendError } = require('../utils/response');

async function createDare(req, res, next) {
  try {
    const dare = await dareService.createDare(req.body);
    return sendSuccess(res, 'Dare created successfully', dare, 201);
  } catch (err) {
    next(err);
  }
}

async function getDareFeed(req, res, next) {
  try {
    const result = await dareService.getDareFeed(req.query);
    return sendSuccess(res, 'Dare feed retrieved', result);
  } catch (err) {
    next(err);
  }
}

async function getDareById(req, res, next) {
  try {
    const dare = await dareService.getDareById(req.params.id);
    if (!dare) {
      return sendError(res, 'Dare not found', 404);
    }
    return sendSuccess(res, 'Dare retrieved', dare);
  } catch (err) {
    next(err);
  }
}

async function updateDareStatus(req, res, next) {
  try {
    const dare = await dareService.updateDareStatus(req.params.id, req.body.status);
    if (!dare) {
      return sendError(res, 'Dare not found', 404);
    }
    return sendSuccess(res, 'Dare status updated', dare);
  } catch (err) {
    next(err);
  }
}

module.exports = { createDare, getDareFeed, getDareById, updateDareStatus };
