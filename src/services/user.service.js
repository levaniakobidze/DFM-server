const prisma = require('../prisma/client');

const PAGE_SIZE = 10;

async function getMyProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) return null;

  const [daresCreated, approvedSubmissions, earnings, totalSubmissions] = await Promise.all([
    prisma.dare.count({ where: { creatorId: userId } }),
    prisma.submission.count({ where: { userId, status: 'APPROVED' } }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: 'REWARD_RELEASED', status: 'COMPLETED' },
    }),
    prisma.submission.count({ where: { userId } }),
  ]);
  const successRate = totalSubmissions > 0
    ? Math.round((approvedSubmissions / totalSubmissions) * 100)
    : 0;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    status: user.status,
    displayName: user.profile?.displayName || user.username,
    bio: user.profile?.bio || null,
    createdAt: user.createdAt,
    stats: {
      daresCreated,
      daresCompleted: approvedSubmissions,
      totalEarned: parseFloat(earnings._sum.amount || 0),
      successRate,
    },
  };
}

async function updateMyProfile(userId, { displayName, bio }) {
  await prisma.profile.upsert({
    where: { userId },
    update: { displayName, bio },
    create: { userId, displayName, bio },
  });
  return getMyProfile(userId);
}

async function getMyDares(userId, { page = 1 } = {}) {
  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * PAGE_SIZE;

  const [dares, total] = await Promise.all([
    prisma.dare.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      include: {
        creator: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { acceptances: true, submissions: true } },
      },
    }),
    prisma.dare.count({ where: { creatorId: userId } }),
  ]);

  return { dares, pagination: { total, page: pageNum, limit: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) } };
}

/** Align DareAcceptance.status with terminal Submission.status (fixes legacy admin-only updates). */
async function syncAcceptanceStatusWithSubmissions(userId) {
  const subs = await prisma.submission.findMany({
    where: { userId, status: { in: ['APPROVED', 'REJECTED'] } },
    select: { status: true, acceptanceId: true },
  });
  for (const s of subs) {
    await prisma.dareAcceptance.updateMany({
      where: { id: s.acceptanceId, status: { not: s.status } },
      data: { status: s.status },
    });
  }
}

async function getMyAcceptances(userId, { page = 1, status, dareId } = {}) {
  await syncAcceptanceStatusWithSubmissions(userId);

  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * PAGE_SIZE;
  const where = {
    userId,
    ...(status ? { status } : {}),
    ...(dareId ? { dareId } : {}),
  };

  const [acceptances, total] = await Promise.all([
    prisma.dareAcceptance.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      include: {
        dare: {
          include: {
            creator: { select: { id: true, username: true, avatarUrl: true } },
            _count: { select: { acceptances: true } },
          },
        },
      },
    }),
    prisma.dareAcceptance.count({ where }),
  ]);

  return { acceptances, pagination: { total, page: pageNum, limit: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) } };
}

async function getMyActivity(userId) {
  const [recentSubmissions, recentAcceptances] = await Promise.all([
    prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { dare: { select: { id: true, title: true } } },
    }),
    prisma.dareAcceptance.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { dare: { select: { id: true, title: true } } },
    }),
  ]);

  const items = [
    ...recentSubmissions.map((s) => ({
      id: s.id,
      type: s.status === 'APPROVED' ? 'success' : s.status === 'REJECTED' ? 'rejected' : 'pending',
      label: `${s.status === 'APPROVED' ? 'Completed' : s.status === 'REJECTED' ? 'Rejected' : 'Proof under review'}: ${s.dare.title}`,
      dareId: s.dareId,
      createdAt: s.createdAt,
    })),
    ...recentAcceptances.map((a) => ({
      id: a.id,
      type: 'category',
      label: `Accepted: ${a.dare.title}`,
      dareId: a.dareId,
      createdAt: a.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return items;
}

module.exports = { getMyProfile, updateMyProfile, getMyDares, getMyAcceptances, getMyActivity };
