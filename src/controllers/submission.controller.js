const submissionService = require('../services/submission.service');
const { sendSuccess, sendError } = require('../utils/response');

async function createSubmission(req, res, next) {
  try {
    const submission = await submissionService.createSubmission(req.body);
    return sendSuccess(res, 'Submission created successfully', submission, 201);
  } catch (err) {
    next(err);
  }
}

async function getSubmissionById(req, res, next) {
  try {
    const submission = await submissionService.getSubmissionById(req.params.id);
    if (!submission) {
      return sendError(res, 'Submission not found', 404);
    }
    return sendSuccess(res, 'Submission retrieved', submission);
  } catch (err) {
    next(err);
  }
}

async function listSubmissions(req, res, next) {
  try {
    const result = await submissionService.listSubmissions(req.query);
    return sendSuccess(res, 'Submissions retrieved', result);
  } catch (err) {
    next(err);
  }
}

async function updateSubmissionStatus(req, res, next) {
  try {
    const submission = await submissionService.updateSubmissionStatus(req.params.id, req.body.status);
    if (!submission) {
      return sendError(res, 'Submission not found', 404);
    }
    return sendSuccess(res, 'Submission status updated', submission);
  } catch (err) {
    next(err);
  }
}

module.exports = { createSubmission, getSubmissionById, listSubmissions, updateSubmissionStatus };
