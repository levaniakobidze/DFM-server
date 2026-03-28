const userService = require('../services/user.service');
const { sendSuccess, sendError } = require('../utils/response');

async function getMe(req, res, next) {
  try {
    const profile = await userService.getMyProfile(req.user.id);
    if (!profile) return sendError(res, 'User not found', 404);
    return sendSuccess(res, 'Profile retrieved', profile);
  } catch (err) { next(err); }
}

async function updateMe(req, res, next) {
  try {
    const { displayName, bio } = req.body;
    const profile = await userService.updateMyProfile(req.user.id, { displayName, bio });
    return sendSuccess(res, 'Profile updated', profile);
  } catch (err) { next(err); }
}

async function getMyDares(req, res, next) {
  try {
    const result = await userService.getMyDares(req.user.id, req.query);
    return sendSuccess(res, 'Dares retrieved', result);
  } catch (err) { next(err); }
}

async function getMyAcceptances(req, res, next) {
  try {
    const result = await userService.getMyAcceptances(req.user.id, req.query);
    return sendSuccess(res, 'Acceptances retrieved', result);
  } catch (err) { next(err); }
}

async function getMyActivity(req, res, next) {
  try {
    const activity = await userService.getMyActivity(req.user.id);
    return sendSuccess(res, 'Activity retrieved', activity);
  } catch (err) { next(err); }
}

module.exports = { getMe, updateMe, getMyDares, getMyAcceptances, getMyActivity };
