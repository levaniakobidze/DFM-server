const { Router } = require('express');
const acceptanceController = require('../controllers/acceptance.controller');
const { acceptanceIdParamRules, updateAcceptanceStatusRules } = require('../validations/acceptance.validation');
const validate = require('../validations/validate');

const router = Router();

// GET /api/acceptances/:id — single acceptance details
router.get('/:id', acceptanceIdParamRules, validate, acceptanceController.getAcceptanceById);

// PATCH /api/acceptances/:id/status — update acceptance status (safe transitions only)
router.patch('/:id/status', updateAcceptanceStatusRules, validate, acceptanceController.updateAcceptanceStatus);

module.exports = router;
