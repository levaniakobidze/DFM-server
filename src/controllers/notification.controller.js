const notificationService = require('../services/notification.service');
const { sendSuccess, sendError } = require('../utils/response');

async function list(req, res, next) {
  try {
    const result = await notificationService.listNotifications(req.user.id, req.query);
    return sendSuccess(res, 'Notifications retrieved', result);
  } catch (err) { next(err); }
}

async function unreadCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    return sendSuccess(res, 'Unread count retrieved', { count });
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    await notificationService.markRead(req.params.id, req.user.id);
    return sendSuccess(res, 'Notification marked as read');
  } catch (err) { next(err); }
}

async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllRead(req.user.id);
    return sendSuccess(res, 'All notifications marked as read');
  } catch (err) { next(err); }
}

module.exports = { list, unreadCount, markRead, markAllRead };
