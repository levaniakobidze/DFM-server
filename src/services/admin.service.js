const prisma = require('../prisma/client');
const { createNotification } = require('./notification.service');

const ADMIN_PAGE_SIZE = 20;
const ADMIN_EMAIL = 'levaniakobidze25@gmail.com';

// ── Stats ──────────────────────────────────────────────────────────────────

async function getStats() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalDares, totalUsers, pendingSubmissions, openReports, rewardsResult, activeThisWeek] =
    await Promise.all([
      prisma.dare.count(),
      prisma.user.count(),
      prisma.submission.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'OPEN' } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'REWARD_RELEASED', status: 'COMPLETED' },
      }),
      prisma.user.count({
        where: {
          OR: [
            { dares: { some: { createdAt: { gte: weekAgo } } } },
            { acceptances: { some: { createdAt: { gte: weekAgo } } } },
            { submissions: { some: { createdAt: { gte: weekAgo } } } },
          ],
        },
      }),
    ]);

  return {
    totalDares,
    totalUsers,
    pendingSubmissions,
    openReports,
    totalRewardsPaid: parseFloat(rewardsResult._sum.amount || 0),
    activeThisWeek,
  };
}

// ── Users ──────────────────────────────────────────────────────────────────

async function listUsers({ page = 1, limit = ADMIN_PAGE_SIZE, search = '' } = {}) {
  const pageNum = parseInt(page);
  const pageSize = Math.min(parseInt(limit), 50);
  const skip = (pageNum - 1) * pageSize;

  const where = search
    ? { OR: [{ email: { contains: search, mode: 'insensitive' } }, { username: { contains: search, mode: 'insensitive' } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        _count: { select: { dares: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  if (users.length === 0) {
    return { users: [], pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  const userIds = users.map((u) => u.id);

  const [approvedCounts, earnings] = await Promise.all([
    prisma.submission.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, status: 'APPROVED' },
      _count: { id: true },
    }),
    prisma.transaction.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, type: 'REWARD_RELEASED', status: 'COMPLETED' },
      _sum: { amount: true },
    }),
  ]);

  const approvedMap = Object.fromEntries(approvedCounts.map((r) => [r.userId, r._count.id]));
  const earningsMap = Object.fromEntries(earnings.map((r) => [r.userId, parseFloat(r._sum.amount || 0)]));

  const enriched = users.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    avatarUrl: u.avatarUrl,
    status: u.status,
    createdAt: u.createdAt,
    daresCreated: u._count.dares,
    daresCompleted: approvedMap[u.id] || 0,
    totalEarned: earningsMap[u.id] || 0,
    isAdmin: u.email === ADMIN_EMAIL,
  }));

  return { users: enriched, pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) } };
}

// ── Submissions ────────────────────────────────────────────────────────────

async function listSubmissions({ page = 1, limit = ADMIN_PAGE_SIZE, status = '' } = {}) {
  const pageNum = parseInt(page);
  const pageSize = Math.min(parseInt(limit), 50);
  const skip = (pageNum - 1) * pageSize;
  const where = status ? { status } : {};

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        dare: { select: { id: true, title: true, rewardAmount: true } },
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    }),
    prisma.submission.count({ where }),
  ]);

  return { submissions, pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) } };
}

// ── Dares ──────────────────────────────────────────────────────────────────

async function listDares({ page = 1, limit = ADMIN_PAGE_SIZE, status = '', search = '' } = {}) {
  const pageNum = parseInt(page);
  const pageSize = Math.min(parseInt(limit), 50);
  const skip = (pageNum - 1) * pageSize;

  const where = {};
  if (status) where.status = status;
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const [dares, total] = await Promise.all([
    prisma.dare.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, username: true } },
        _count: { select: { acceptances: true, submissions: true } },
      },
    }),
    prisma.dare.count({ where }),
  ]);

  return { dares, pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) } };
}

// ── Reports ────────────────────────────────────────────────────────────────

async function listReports({ page = 1, limit = ADMIN_PAGE_SIZE, status = '' } = {}) {
  const pageNum = parseInt(page);
  const pageSize = Math.min(parseInt(limit), 50);
  const skip = (pageNum - 1) * pageSize;
  const where = status ? { status } : {};

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { id: true, username: true, email: true } } },
    }),
    prisma.report.count({ where }),
  ]);

  return { reports, pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) } };
}

// ── Request Logs ───────────────────────────────────────────────────────────

async function listRequests({ page = 1, limit = ADMIN_PAGE_SIZE, method = '', statusGroup = '', search = '' } = {}) {
  const pageNum = parseInt(page);
  const pageSize = Math.min(parseInt(limit), 50);
  const skip = (pageNum - 1) * pageSize;

  const where = {};
  if (method) where.method = method.toUpperCase();
  if (statusGroup === 'success') where.statusCode = { gte: 200, lt: 300 };
  else if (statusGroup === 'redirect') where.statusCode = { gte: 300, lt: 400 };
  else if (statusGroup === 'client_error') where.statusCode = { gte: 400, lt: 500 };
  else if (statusGroup === 'server_error') where.statusCode = { gte: 500 };

  if (search) {
    where.OR = [
      { path: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
      { ip: { contains: search } },
    ];
  }

  const [requests, total] = await Promise.all([
    prisma.requestLog.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
    prisma.requestLog.count({ where }),
  ]);

  return { requests, pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) } };
}

// ── Mutations ──────────────────────────────────────────────────────────────

async function updateSubmissionStatus(id, status) {
  const sub = await prisma.submission.findUnique({ where: { id } });
  if (!sub) return null;

  const updated = await prisma.submission.update({
    where: { id },
    data: { status },
    include: {
      dare: { select: { id: true, title: true, rewardAmount: true } },
      user: { select: { id: true, username: true } },
    },
  });

  if (status === 'APPROVED') {
    createNotification(
      updated.userId,
      'SUBMISSION_APPROVED',
      `Your proof for "${updated.dare.title}" was approved!`,
      updated.dareId,
    );
    const reward = parseFloat(updated.dare.rewardAmount || 0);
    if (reward > 0) {
      createNotification(
        updated.userId,
        'REWARD_RECEIVED',
        `You earned $${reward.toFixed(2)} for completing "${updated.dare.title}"`,
        updated.dareId,
      );
    }
  } else if (status === 'REJECTED') {
    createNotification(
      updated.userId,
      'SUBMISSION_REJECTED',
      `Your proof for "${updated.dare.title}" was rejected.`,
      updated.dareId,
    );
  }

  return updated;
}

async function updateUserStatus(id, status) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  const updated = await prisma.user.update({ where: { id }, data: { status } });

  const notifMap = {
    BLOCKED:     { type: 'ACCOUNT_BLOCKED',      message: 'Your account has been blocked by an admin.' },
    PAUSED:      { type: 'ACCOUNT_PAUSED',        message: 'Your account has been temporarily paused by an admin.' },
    ACTIVE:      { type: 'ACCOUNT_REACTIVATED',   message: 'Your account has been reactivated. Welcome back!' },
  };
  const notif = notifMap[status];
  if (notif) createNotification(id, notif.type, notif.message);

  return updated;
}

async function deleteUser(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { dares: true, acceptances: true, submissions: true } } },
  });
  if (!user) return null;

  const hasActivity = user._count.dares > 0 || user._count.acceptances > 0 || user._count.submissions > 0;
  if (hasActivity) {
    const err = new Error('Cannot delete a user with existing dares, acceptances, or submissions. Block them instead.');
    err.statusCode = 409;
    throw err;
  }

  // Safe to delete — only notifications, reports, profile, transactions remain
  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { userId: id } }),
    prisma.report.deleteMany({ where: { reporterId: id } }),
    prisma.transaction.deleteMany({ where: { userId: id } }),
    prisma.profile.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  return { id };
}

async function updateDareStatus(id, status) {
  const dare = await prisma.dare.findUnique({ where: { id } });
  if (!dare) return null;
  return prisma.dare.update({
    where: { id },
    data: { status },
    include: { creator: { select: { id: true, username: true } } },
  });
}

async function updateReportStatus(id, status) {
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return null;
  return prisma.report.update({
    where: { id },
    data: { status },
    include: { reporter: { select: { id: true, username: true } } },
  });
}

module.exports = {
  getStats,
  listUsers,
  listSubmissions,
  listDares,
  listReports,
  listRequests,
  updateUserStatus,
  deleteUser,
  updateSubmissionStatus,
  updateDareStatus,
  updateReportStatus,
};
