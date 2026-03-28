const { Router } = require('express');
const healthRouter = require('./health');
const daresRouter = require('./dares');
const acceptancesRouter = require('./acceptances');

const router = Router();

router.use('/health', healthRouter);
router.use('/dares', daresRouter);
router.use('/acceptances', acceptancesRouter);

// Future routes will be added here:
// router.use('/submissions', submissionsRouter);
// router.use('/users', usersRouter);
// router.use('/wallet', walletRouter);
// router.use('/reports', reportsRouter);

module.exports = router;
