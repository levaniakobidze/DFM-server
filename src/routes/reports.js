const { Router } = require('express');
const reportController = require('../controllers/report.controller');
const { createReportRules, listReportsRules, reportIdParamRules } = require('../validations/report.validation');
const validate = require('../validations/validate');

const router = Router();

// GET /api/reports — moderation queue (defaults to status=OPEN, filterable by targetType)
router.get('/', listReportsRules, validate, reportController.listReports);

// GET /api/reports/:id — single report details
router.get('/:id', reportIdParamRules, validate, reportController.getReportById);

// POST /api/reports — file a report against a dare or submission
router.post('/', createReportRules, validate, reportController.createReport);

module.exports = router;
