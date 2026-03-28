const { body, param, query } = require('express-validator');
const { REPORT_TARGET_TYPES, REPORT_STATUSES } = require('../constants/report.constants');

const createReportRules = [
  // TODO: replace reporterId with req.user.id once auth (Phase 8) is implemented
  body('reporterId')
    .notEmpty().withMessage('reporterId is required')
    .isUUID().withMessage('reporterId must be a valid UUID'),

  body('targetType')
    .notEmpty().withMessage('targetType is required')
    .isIn(REPORT_TARGET_TYPES).withMessage(`targetType must be one of: ${REPORT_TARGET_TYPES.join(', ')}`),

  body('targetId')
    .notEmpty().withMessage('targetId is required')
    .isUUID().withMessage('targetId must be a valid UUID'),

  body('reason')
    .notEmpty().withMessage('reason is required')
    .isLength({ min: 10, max: 500 }).withMessage('reason must be between 10 and 500 characters'),
];

const listReportsRules = [
  query('status')
    .optional()
    .isIn(REPORT_STATUSES).withMessage(`Status must be one of: ${REPORT_STATUSES.join(', ')}`),

  query('targetType')
    .optional()
    .isIn(REPORT_TARGET_TYPES).withMessage(`targetType must be one of: ${REPORT_TARGET_TYPES.join(', ')}`),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

const reportIdParamRules = [
  param('id')
    .isUUID().withMessage('Report ID must be a valid UUID'),
];

module.exports = { createReportRules, listReportsRules, reportIdParamRules };
