const { param, query } = require('express-validator');
const { TRANSACTION_TYPES, TRANSACTION_STATUSES } = require('../constants/wallet.constants');

const userIdParamRules = [
  param('userId')
    .isUUID().withMessage('userId must be a valid UUID'),
];

const listTransactionsRules = [
  param('userId')
    .isUUID().withMessage('userId must be a valid UUID'),

  query('type')
    .optional()
    .isIn(TRANSACTION_TYPES).withMessage(`type must be one of: ${TRANSACTION_TYPES.join(', ')}`),

  query('status')
    .optional()
    .isIn(TRANSACTION_STATUSES).withMessage(`status must be one of: ${TRANSACTION_STATUSES.join(', ')}`),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

module.exports = { userIdParamRules, listTransactionsRules };
