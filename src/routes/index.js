const { Router } = require('express');
const healthRouter = require('./health');

const router = Router();

// Mount feature routers here as they are built
router.use('/health', healthRouter);

// Future routes will be added here:
// router.use('/dares', daresRouter);
// router.use('/submissions', submissionsRouter);
// router.use('/users', usersRouter);
// router.use('/wallet', walletRouter);
// router.use('/reports', reportsRouter);

module.exports = router;
