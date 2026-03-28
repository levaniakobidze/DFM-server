const { Router } = require('express');
const healthRouter = require('./health');
const daresRouter = require('./dares');
const acceptancesRouter = require('./acceptances');
const submissionsRouter = require('./submissions');
const reportsRouter = require('./reports');

const router = Router();

router.use('/health', healthRouter);
router.use('/dares', daresRouter);
router.use('/acceptances', acceptancesRouter);
router.use('/submissions', submissionsRouter);
router.use('/reports', reportsRouter);

// Future routes will be added here:
// router.use('/users', usersRouter);
// router.use('/wallet', walletRouter);

module.exports = router;
