const { Router } = require('express');
const submissionController = require('../controllers/submission.controller');
const { createSubmissionRules, listSubmissionsRules, submissionIdParamRules, updateSubmissionStatusRules } = require('../validations/submission.validation');
const validate = require('../validations/validate');

const router = Router();

// GET /api/submissions — list submissions (filter by userId, dareId, status)
router.get('/', listSubmissionsRules, validate, submissionController.listSubmissions);

// GET /api/submissions/:id — single submission details
router.get('/:id', submissionIdParamRules, validate, submissionController.getSubmissionById);

// POST /api/submissions — create a new submission
router.post('/', createSubmissionRules, validate, submissionController.createSubmission);

// PATCH /api/submissions/:id/status — approve or reject a submission (safe transitions only)
router.patch('/:id/status', updateSubmissionStatusRules, validate, submissionController.updateSubmissionStatus);

module.exports = router;
