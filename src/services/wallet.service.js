const prisma = require('../prisma/client');
const {
  WALLET_DEFAULT_PAGE_SIZE,
  WALLET_MAX_PAGE_SIZE,
} = require('../constants/wallet.constants');

async function getWalletSummary(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Pending balance: rewards earned but not yet released
  const pendingResult = await prisma.transaction.aggregate({
    where: { userId, type: 'REWARD_PENDING', status: 'PENDING' },
    _sum: { amount: true },
  });

  // Available balance: released rewards minus completed withdrawals and reversals
  const releasedResult = await prisma.transaction.aggregate({
    where: { userId, type: 'REWARD_RELEASED', status: 'COMPLETED' },
    _sum: { amount: true },
  });

  const withdrawalsResult = await prisma.transaction.aggregate({
    where: { userId, type: 'WITHDRAWAL', status: 'COMPLETED' },
    _sum: { amount: true },
  });

  const reversalsResult = await prisma.transaction.aggregate({
    where: { userId, type: 'REWARD_REVERSED', status: 'COMPLETED' },
    _sum: { amount: true },
  });

  const released = Number(releasedResult._sum.amount ?? 0);
  const withdrawn = Number(withdrawalsResult._sum.amount ?? 0);
  const reversed = Number(reversalsResult._sum.amount ?? 0);

  return {
    userId,
    pendingBalance: Number(pendingResult._sum.amount ?? 0),
    availableBalance: Math.max(0, released - withdrawn - reversed),
    totalEarned: released,
  };
}

async function listTransactions(userId, { type, status, page, limit }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const pageNum = parseInt(page) || 1;
  const pageSize = Math.min(parseInt(limit) || WALLET_DEFAULT_PAGE_SIZE, WALLET_MAX_PAGE_SIZE);
  const skip = (pageNum - 1) * pageSize;

  const where = { userId };
  if (type) where.type = type;
  if (status) where.status = status;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        dare: { select: { id: true, title: true } },
        submission: { select: { id: true, status: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

module.exports = { getWalletSummary, listTransactions };
