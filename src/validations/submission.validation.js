const { body, param, query } = require('express-validator');

const VALID_PROOF_TYPES = ['PHOTO', 'VIDEO', 'TEXT'];
const VALID_SUBMISSION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

const createSubmissionRules = [
  // TODO: replace userId with req.user.id once auth (Phase 8) is implemented
  body('userId')
    .notEmpty().withMessage('userId is required')
    .isUUID().withMessage('userId must be a valid UUID'),

  body('acceptanceId')
    .notEmpty().withMessage('acceptanceId is required')
    .isUUID().withMessage('acceptanceId must be a valid UUID'),

  body('proofUrl')
    .optional()
    .isURL().withMessage('proofUrl must be a valid URL'),

  body('proofType')
    .optional()
    .isIn(VALID_PROOF_TYPES).withMessage(`proofType must be one of: ${VALID_PROOF_TYPES.join(', ')}`),

  body('note')
    .optional()
    .isLength({ max: 500 }).withMessage('Note must be at most 500 characters'),
];

const listSubmissionsRules = [
  query('userId')
    .optional()
    .isUUID().withMessage('userId must be a valid UUID'),

  query('dareId')
    .optional()
    .isUUID().withMessage('dareId must be a valid UUID'),

  query('status')
    .optional()
    .isIn(VALID_SUBMISSION_STATUSES).withMessage(`Status must be one of: ${VALID_SUBMISSION_STATUSES.join(', ')}`),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

const submissionIdParamRules = [
  param('id')
    .isUUID().withMessage('Submission ID must be a valid UUID'),
];

module.exports = { createSubmissionRules, listSubmissionsRules, submissionIdParamRules };
