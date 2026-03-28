const walletService = require('../services/wallet.service');
const { sendSuccess } = require('../utils/response');

async function getWalletSummary(req, res, next) {
  try {
    const summary = await walletService.getWalletSummary(req.params.userId);
    return sendSuccess(res, 'Wallet summary retrieved', summary);
  } catch (err) {
    next(err);
  }
}

async function listTransactions(req, res, next) {
  try {
    const result = await walletService.listTransactions(req.params.userId, req.query);
    return sendSuccess(res, 'Transaction history retrieved', result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getWalletSummary, listTransactions };
