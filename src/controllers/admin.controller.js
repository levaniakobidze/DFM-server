const adminService = require('../services/admin.service');
const { sendSuccess, sendError } = require('../utils/response');

async function getStats(req, res, next) {
  try {
    return sendSuccess(res, 'Stats retrieved', await adminService.getStats());
  } catch (err) { next(err); }
}

async function listUsers(req, res, next) {
  try {
    return sendSuccess(res, 'Users retrieved', await adminService.listUsers(req.query));
  } catch (err) { next(err); }
}

async function listSubmissions(req, res, next) {
  try {
    return sendSuccess(res, 'Submissions retrieved', await adminService.listSubmissions(req.query));
  } catch (err) { next(err); }
}

async function listDares(req, res, next) {
  try {
    return sendSuccess(res, 'Dares retrieved', await adminService.listDares(req.query));
  } catch (err) { next(err); }
}

async function listReports(req, res, next) {
  try {
    return sendSuccess(res, 'Reports retrieved', await adminService.listReports(req.query));
  } catch (err) { next(err); }
}

async function listRequests(req, res, next) {
  try {
    return sendSuccess(res, 'Requests retrieved', await adminService.listRequests(req.query));
  } catch (err) { next(err); }
}

async function updateUserStatus(req, res, next) {
  try {
    const result = await adminService.updateUserStatus(req.params.id, req.body.status);
    if (!result) return sendError(res, 'User not found', 404);
    return sendSuccess(res, 'User status updated', result);
  } catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
  try {
    const result = await adminService.deleteUser(req.params.id);
    if (!result) return sendError(res, 'User not found', 404);
    return sendSuccess(res, 'User deleted');
  } catch (err) { next(err); }
}

async function updateSubmissionStatus(req, res, next) {
  try {
    const result = await adminService.updateSubmissionStatus(req.params.id, req.body.status);
    if (!result) return sendError(res, 'Submission not found', 404);
    return sendSuccess(res, 'Submission updated', result);
  } catch (err) { next(err); }
}

async function updateDareStatus(req, res, next) {
  try {
    const result = await adminService.updateDareStatus(req.params.id, req.body.status);
    if (!result) return sendError(res, 'Dare not found', 404);
    return sendSuccess(res, 'Dare updated', result);
  } catch (err) { next(err); }
}

async function updateReportStatus(req, res, next) {
  try {
    const result = await adminService.updateReportStatus(req.params.id, req.body.status);
    if (!result) return sendError(res, 'Report not found', 404);
    return sendSuccess(res, 'Report updated', result);
  } catch (err) { next(err); }
}

module.exports = {
  getStats, listUsers, listSubmissions, listDares, listReports, listRequests,
  updateUserStatus, deleteUser,
  updateSubmissionStatus, updateDareStatus, updateReportStatus,
};
