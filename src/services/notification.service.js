const prisma = require('../prisma/client');

const PAGE_SIZE = 20;

/**
 * Fire-and-forget — never throws, so callers don't need try/catch.
 */
async function createNotification(userId, type, message, dareId = null) {
  try {
    await prisma.notification.create({ data: { userId, type, message, dareId } });
  } catch (err) {
    console.error('[notification] Failed to create:', err.message);
  }
}

async function listNotifications(userId, { page = 1 } = {}) {
  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * PAGE_SIZE;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: { total, page: pageNum, limit: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) },
  };
}

async function getUnreadCount(userId) {
  return prisma.notification.count({ where: { userId, read: false } });
}

async function markRead(id, userId) {
  return prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });
}

async function markAllRead(userId) {
  return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}

module.exports = { createNotification, listNotifications, getUnreadCount, markRead, markAllRead };
