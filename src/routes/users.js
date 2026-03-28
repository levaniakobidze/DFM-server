const { Router } = require('express');
const { body } = require('express-validator');
const { requireAuth, attachUser } = require('../middlewares/auth');
const { sendSuccess } = require('../utils/response');
const userController = require('../controllers/user.controller');
const validate = require('../validations/validate');

const router = Router();

// Status check — intentionally bypasses requireAuth so blocked users can still
// fetch their status for the banner.
router.get('/me/status', async (req, res) => {
  if (!req.user) return res.status(200).json({ success: true, data: null });
  return sendSuccess(res, 'OK', { status: req.user.status ?? 'ACTIVE' });
});

// All routes below require auth
router.use(requireAuth);

router.get('/me',               userController.getMe);
router.patch('/me',
  [
    body('displayName').optional().isString().trim().isLength({ max: 50 }),
    body('bio').optional().isString().trim().isLength({ max: 300 }),
  ],
  validate,
  userController.updateMe,
);
router.get('/me/dares',         userController.getMyDares);
router.get('/me/acceptances',   userController.getMyAcceptances);
router.get('/me/activity',      userController.getMyActivity);

module.exports = router;
