const acceptanceService = require('../services/acceptance.service');
const { sendSuccess, sendError } = require('../utils/response');

async function acceptDare(req, res, next) {
  try {
    const acceptance = await acceptanceService.acceptDare(req.params.id, req.body.userId);
    return sendSuccess(res, 'Dare accepted successfully', acceptance, 201);
  } catch (err) {
    next(err);
  }
}

async function getDareAcceptances(req, res, next) {
  try {
    const acceptances = await acceptanceService.getDareAcceptances(req.params.id);
    return sendSuccess(res, 'Acceptances retrieved', acceptances);
  } catch (err) {
    next(err);
  }
}

async function getAcceptanceById(req, res, next) {
  try {
    const acceptance = await acceptanceService.getAcceptanceById(req.params.id);
    if (!acceptance) {
      return sendError(res, 'Acceptance not found', 404);
    }
    return sendSuccess(res, 'Acceptance retrieved', acceptance);
  } catch (err) {
    next(err);
  }
}

async function updateAcceptanceStatus(req, res, next) {
  try {
    const acceptance = await acceptanceService.updateAcceptanceStatus(req.params.id, req.body.status);
    if (!acceptance) {
      return sendError(res, 'Acceptance not found', 404);
    }
    return sendSuccess(res, 'Acceptance status updated', acceptance);
  } catch (err) {
    next(err);
  }
}

module.exports = { acceptDare, getDareAcceptances, getAcceptanceById, updateAcceptanceStatus };
