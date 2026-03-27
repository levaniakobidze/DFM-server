const { Router } = require('express');
const dareController = require('../controllers/dare.controller');
const { createDareRules, getDareFeedRules, dareIdParamRules } = require('../validations/dare.validation');
const validate = require('../validations/validate');

const router = Router();

// GET /api/dares — paginated dare feed with filtering and sorting
router.get('/', getDareFeedRules, validate, dareController.getDareFeed);

// GET /api/dares/:id — single dare details
router.get('/:id', dareIdParamRules, validate, dareController.getDareById);

// POST /api/dares — create a new dare
router.post('/', createDareRules, validate, dareController.createDare);

// PATCH /api/dares/:id/status — update dare status (safe transitions only)
router.patch('/:id/status', dareIdParamRules, validate, dareController.updateDareStatus);

module.exports = router;
