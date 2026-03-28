const { body, param } = require('express-validator');

const VALID_ACCEPTANCE_STATUSES = ['ACCEPTED', 'CANCELLED', 'SUBMITTED', 'APPROVED', 'REJECTED'];

const acceptDareRules = [
  // TODO: replace userId with req.user.id once auth (Phase 8) is implemented
  body('userId')
    .notEmpty().withMessage('userId is required')
    .isUUID().withMessage('userId must be a valid UUID'),
];

const updateAcceptanceStatusRules = [
  param('id')
    .isUUID().withMessage('Acceptance ID must be a valid UUID'),

  body('status')
    .notEmpty().withMessage('status is required')
    .isIn(VALID_ACCEPTANCE_STATUSES).withMessage(`Status must be one of: ${VALID_ACCEPTANCE_STATUSES.join(', ')}`),
];

const acceptanceIdParamRules = [
  param('id')
    .isUUID().withMessage('Acceptance ID must be a valid UUID'),
];

module.exports = { acceptDareRules, updateAcceptanceStatusRules, acceptanceIdParamRules };
