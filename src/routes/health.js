const { Router } = require('express');
const { sendSuccess } = require('../utils/response');

const router = Router();

// GET /api/health
router.get('/', (req, res) => {
  sendSuccess(res, 'Server is running', { status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
