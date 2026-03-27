const { body, query, param } = require('express-validator');

const VALID_CATEGORIES = ['FUNNY', 'FITNESS', 'CREATIVE', 'SOCIAL', 'FOOD', 'OUTDOOR', 'CHALLENGE', 'OTHER'];
const VALID_PROOF_TYPES = ['PHOTO', 'VIDEO', 'TEXT'];
const VALID_SORT_OPTIONS = ['newest', 'oldest', 'reward_high', 'reward_low'];

const createDareRules = [
  // TODO: replace creatorId with req.user.id once auth (Phase 8) is implemented
  body('creatorId')
    .notEmpty().withMessage('creatorId is required')
    .isUUID().withMessage('creatorId must be a valid UUID'),

  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),

  body('category')
    .optional()
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('rewardAmount')
    .notEmpty().withMessage('Reward amount is required')
    .isFloat({ min: 0.01 }).withMessage('Reward amount must be a positive number'),

  body('proofType')
    .optional()
    .isIn(VALID_PROOF_TYPES).withMessage(`Proof type must be one of: ${VALID_PROOF_TYPES.join(', ')}`),

  body('expiresAt')
    .optional()
    .isISO8601().withMessage('expiresAt must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('expiresAt must be a future date');
      }
      return true;
    }),
];

const getDareFeedRules = [
  query('status')
    .optional()
    .isIn(['DRAFT', 'ACTIVE', 'CLOSED', 'COMPLETED', 'REJECTED', 'CANCELLED'])
    .withMessage('Invalid status filter'),

  query('category')
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  query('sort')
    .optional()
    .isIn(VALID_SORT_OPTIONS)
    .withMessage(`Sort must be one of: ${VALID_SORT_OPTIONS.join(', ')}`),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

const dareIdParamRules = [
  param('id')
    .isUUID().withMessage('Dare ID must be a valid UUID'),
];

module.exports = { createDareRules, getDareFeedRules, dareIdParamRules };
