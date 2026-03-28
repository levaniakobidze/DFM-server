const { Router } = require('express');
const healthRouter = require('./health');
const daresRouter = require('./dares');
const acceptancesRouter = require('./acceptances');
const submissionsRouter = require('./submissions');

const router = Router();

router.use('/health', healthRouter);
router.use('/dares', daresRouter);
router.use('/acceptances', acceptancesRouter);
router.use('/submissions', submissionsRouter);

// Future routes will be added here:
// router.use('/users', usersRouter);
// router.use('/wallet', walletRouter);
// router.use('/reports', reportsRouter);

module.exports = router;
