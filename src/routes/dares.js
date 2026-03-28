const { Router } = require('express');
const dareController = require('../controllers/dare.controller');
const acceptanceController = require('../controllers/acceptance.controller');
const { createDareRules, getDareFeedRules, dareIdParamRules } = require('../validations/dare.validation');
const { acceptDareRules } = require('../validations/acceptance.validation');
const validate = require('../validations/validate');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

// GET /api/dares — paginated dare feed with filtering and sorting
router.get('/', getDareFeedRules, validate, dareController.getDareFeed);

// GET /api/dares/:id — single dare details
router.get('/:id', dareIdParamRules, validate, dareController.getDareById);

// POST /api/dares — create a new dare (auth required)
router.post('/', requireAuth, createDareRules, validate, dareController.createDare);

// PATCH /api/dares/:id/status — update dare status (auth required)
router.patch('/:id/status', requireAuth, dareIdParamRules, validate, dareController.updateDareStatus);

// POST /api/dares/:id/acceptances — accept a dare (auth required)
router.post('/:id/acceptances', requireAuth, dareIdParamRules, acceptDareRules, validate, acceptanceController.acceptDare);

// GET /api/dares/:id/acceptances — list all acceptances for a dare
router.get('/:id/acceptances', dareIdParamRules, validate, acceptanceController.getDareAcceptances);

module.exports = router;
