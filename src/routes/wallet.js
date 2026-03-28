const { Router } = require('express');
const walletController = require('../controllers/wallet.controller');
const { userIdParamRules, listTransactionsRules } = require('../validations/wallet.validation');
const validate = require('../validations/validate');

const router = Router();

// GET /api/wallet/:userId — wallet summary (pending, available, total earned)
router.get('/:userId', userIdParamRules, validate, walletController.getWalletSummary);

// GET /api/wallet/:userId/transactions — paginated transaction history
router.get('/:userId/transactions', listTransactionsRules, validate, walletController.listTransactions);

module.exports = router;
