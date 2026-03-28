const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth');
const notificationController = require('../controllers/notification.controller');

const router = Router();
router.use(requireAuth);

router.get('/',            notificationController.list);
router.get('/unread-count', notificationController.unreadCount);
router.patch('/read-all',  notificationController.markAllRead);
router.patch('/:id/read',  notificationController.markRead);

module.exports = router;
