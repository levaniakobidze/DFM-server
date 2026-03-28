const reportService = require('../services/report.service');
const { sendSuccess, sendError } = require('../utils/response');

async function createReport(req, res, next) {
  try {
    const report = await reportService.createReport(req.body);
    return sendSuccess(res, 'Report submitted successfully', report, 201);
  } catch (err) {
    next(err);
  }
}

async function getReportById(req, res, next) {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) {
      return sendError(res, 'Report not found', 404);
    }
    return sendSuccess(res, 'Report retrieved', report);
  } catch (err) {
    next(err);
  }
}

async function listReports(req, res, next) {
  try {
    const result = await reportService.listReports(req.query);
    return sendSuccess(res, 'Reports retrieved', result);
  } catch (err) {
    next(err);
  }
}

module.exports = { createReport, getReportById, listReports };
