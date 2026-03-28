const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../validations/validate');
const { attachUser, requireAuth } = require('../middlewares/auth');
const { sendSuccess, sendError } = require('../utils/response');
const paymentService = require('../services/payment.service');

const router = Router();

/**
 * POST /api/payments/checkout
 * Creates a Paddle transaction for funding a dare.
 *
 * Returns { transactionId, checkoutUrl } — the frontend passes
 * transactionId to Paddle.js to open the checkout overlay.
 */
router.post(
  '/checkout',
  attachUser,
  requireAuth,
  [
    body('dareId')
      .notEmpty().withMessage('dareId is required')
      .isUUID().withMessage('dareId must be a valid UUID'),
    body('amount')
      .notEmpty().withMessage('amount is required')
      .isFloat({ min: 1 }).withMessage('amount must be at least 1'),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 }).withMessage('currency must be a 3-letter ISO code'),
    body('returnUrl')
      .optional()
      .isURL({ require_tld: false }).withMessage('returnUrl must be a valid URL'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { dareId, amount, currency, returnUrl } = req.body;
      const result = await paymentService.createCheckout({
        userId: req.user.id,
        email: req.user.email,
        dareId,
        amount: parseFloat(amount),
        currency,
        returnUrl,
      });
      return sendSuccess(res, 'Checkout created', result, 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/payments/webhook
 * Receives Paddle webhook events.
 *
 * IMPORTANT: This route must receive the raw body (not JSON-parsed)
 * for signature verification. The express.json() middleware must NOT
 * run on this route. See server.js for how this is handled.
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['paddle-signature'];
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing Paddle-Signature header' });
    }

    // req.rawBody is populated by the raw-body middleware applied in server.js
    await paymentService.handleWebhook(req.rawBody, signature);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Paddle webhook error]', err.message);
    // Always return 200 to Paddle so it doesn't retry indefinitely,
    // unless it's a signature failure (400 is safe to return).
    const status = err.statusCode === 400 ? 400 : 200;
    return res.status(status).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/payments/me
 * Returns the authenticated user's payment history.
 */
router.get('/me', attachUser, requireAuth, async (req, res, next) => {
  try {
    const result = await paymentService.listMyPayments(req.user.id, req.query);
    return sendSuccess(res, 'Payments retrieved', result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/payments/payout-detail
 * Returns the user's stored payout method (metadata only, never raw bank details).
 */
router.get('/payout-detail', attachUser, requireAuth, async (req, res, next) => {
  try {
    const detail = await paymentService.getPayoutDetail(req.user.id);
    return sendSuccess(res, 'Payout detail retrieved', detail);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/payments/payout-detail
 * Saves the user's preferred payout method.
 * Foundation only — no live payout is triggered from here.
 */
router.put(
  '/payout-detail',
  attachUser,
  requireAuth,
  [
    body('method')
      .notEmpty().withMessage('method is required')
      .isIn(['bank_transfer', 'paypal', 'wise'])
      .withMessage('method must be bank_transfer, paypal, or wise'),
    body('details')
      .notEmpty().withMessage('details are required')
      .isObject().withMessage('details must be an object'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { method, details } = req.body;
      await paymentService.savePayoutDetail(req.user.id, { method, details });
      return sendSuccess(res, 'Payout detail saved');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
