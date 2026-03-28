const { Router } = require('express');
const submissionController = require('../controllers/submission.controller');
const { createSubmissionRules, listSubmissionsRules, submissionIdParamRules } = require('../validations/submission.validation');
const validate = require('../validations/validate');

const router = Router();

// GET /api/submissions — list submissions (filter by userId, dareId, status)
router.get('/', listSubmissionsRules, validate, submissionController.listSubmissions);

// GET /api/submissions/:id — single submission details
router.get('/:id', submissionIdParamRules, validate, submissionController.getSubmissionById);

// POST /api/submissions — create a new submission
router.post('/', createSubmissionRules, validate, submissionController.createSubmission);

module.exports = router;
