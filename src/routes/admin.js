const { Router } = require('express');
const { body, param } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { requireAuth } = require('../middlewares/auth');
const { sendError } = require('../utils/response');
const validate = require('../validations/validate');

const ADMIN_EMAIL = 'levaniakobidze25@gmail.com';

function requireAdmin(req, res, next) {
  if (!req.user || req.user.email !== ADMIN_EMAIL) {
    return sendError(res, 'Admin access required', 403);
  }
  next();
}

const router = Router();
router.use(requireAuth, requireAdmin);

// ── Read ────────────────────────────────────────────────────────────────────
router.get('/stats',       adminController.getStats);
router.get('/users',       adminController.listUsers);

router.patch(
  '/users/:id/status',
  [
    param('id').isUUID(),
    body('status').isIn(['ACTIVE', 'PAUSED', 'BLOCKED']).withMessage('Invalid user status'),
  ],
  validate,
  adminController.updateUserStatus,
);

router.delete(
  '/users/:id',
  [param('id').isUUID()],
  validate,
  adminController.deleteUser,
);
router.get('/submissions', adminController.listSubmissions);
router.get('/dares',       adminController.listDares);
router.get('/reports',     adminController.listReports);
router.get('/requests',    adminController.listRequests);

// ── Mutations ───────────────────────────────────────────────────────────────
router.patch(
  '/submissions/:id/status',
  [
    param('id').isUUID(),
    body('status').isIn(['PENDING', 'APPROVED', 'REJECTED']).withMessage('Invalid submission status'),
  ],
  validate,
  adminController.updateSubmissionStatus,
);

router.patch(
  '/dares/:id/status',
  [
    param('id').isUUID(),
    body('status').isIn(['DRAFT', 'ACTIVE', 'CLOSED', 'COMPLETED', 'REJECTED', 'CANCELLED']).withMessage('Invalid dare status'),
  ],
  validate,
  adminController.updateDareStatus,
);

router.patch(
  '/reports/:id/status',
  [
    param('id').isUUID(),
    body('status').isIn(['OPEN', 'REVIEWED', 'DISMISSED']).withMessage('Invalid report status'),
  ],
  validate,
  adminController.updateReportStatus,
);

module.exports = router;
