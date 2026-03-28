const { Router } = require('express');
const healthRouter = require('./health');
const daresRouter = require('./dares');
const acceptancesRouter = require('./acceptances');
const submissionsRouter = require('./submissions');
const reportsRouter = require('./reports');
const walletRouter = require('./wallet');
const uploadsRouter = require('./uploads');
const adminRouter = require('./admin');
const notificationsRouter = require('./notifications');
const usersRouter = require('./users');
const paymentsRouter = require('./payments');

const router = Router();

router.use('/health', healthRouter);
router.use('/dares', daresRouter);
router.use('/acceptances', acceptancesRouter);
router.use('/submissions', submissionsRouter);
router.use('/reports', reportsRouter);
router.use('/wallet', walletRouter);
router.use('/uploads', uploadsRouter);
router.use('/admin', adminRouter);
router.use('/notifications', notificationsRouter);
router.use('/users', usersRouter);
router.use('/payments', paymentsRouter);

module.exports = router;
