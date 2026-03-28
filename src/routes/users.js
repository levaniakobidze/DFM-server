const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth');
const { sendSuccess } = require('../utils/response');

const router = Router();

// Returns the current user's DB record (status, username, etc.)
// Note: requireAuth already blocks BLOCKED/PAUSED — we skip it here intentionally
// so the frontend can still fetch status to show the banner.
router.get('/me', async (req, res, next) => {
  try {
    if (!req.user) return res.status(200).json({ success: true, data: null });
    return sendSuccess(res, 'OK', {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      status: req.user.status ?? 'ACTIVE',
    });
  } catch (err) { next(err); }
});

module.exports = router;
