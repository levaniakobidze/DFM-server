const prisma = require('../prisma/client');
const {
  DARE_STATUS_TRANSITIONS,
  DARE_SORT_FIELDS,
  DARE_DEFAULT_PAGE_SIZE,
  DARE_MAX_PAGE_SIZE,
} = require('../constants/dare.constants');

async function createDare(data) {
  const { creatorId, title, description, category, rewardAmount, proofType, expiresAt } = data;

  const dare = await prisma.dare.create({
    data: {
      creatorId,
      title,
      description,
      category: category || 'OTHER',
      rewardAmount,
      proofType: proofType || 'PHOTO',
      status: 'ACTIVE',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
    include: {
      creator: { select: { id: true, username: true, avatarUrl: true } },
    },
  });

  return dare;
}

async function getDareFeed({ status, category, sort, page, limit }) {
  const pageNum = parseInt(page) || 1;
  const pageSize = Math.min(parseInt(limit) || DARE_DEFAULT_PAGE_SIZE, DARE_MAX_PAGE_SIZE);
  const skip = (pageNum - 1) * pageSize;

  const where = {};
  if (status) where.status = status;
  else where.status = 'ACTIVE'; // default to active dares only
  if (category) where.category = category;

  const orderBy = DARE_SORT_FIELDS[sort] || DARE_SORT_FIELDS.newest;

  const [dares, total] = await Promise.all([
    prisma.dare.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        creator: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { acceptances: true } },
      },
    }),
    prisma.dare.count({ where }),
  ]);

  return {
    dares,
    pagination: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

async function getDareById(id) {
  const dare = await prisma.dare.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { acceptances: true, submissions: true } },
    },
  });

  return dare;
}

async function updateDareStatus(id, newStatus) {
  const dare = await prisma.dare.findUnique({ where: { id } });

  if (!dare) return null;

  const allowed = DARE_STATUS_TRANSITIONS[dare.status] || [];
  if (!allowed.includes(newStatus)) {
    const err = new Error(`Cannot transition dare from ${dare.status} to ${newStatus}`);
    err.statusCode = 400;
    throw err;
  }

  return prisma.dare.update({
    where: { id },
    data: { status: newStatus },
    include: {
      creator: { select: { id: true, username: true, avatarUrl: true } },
    },
  });
}

module.exports = { createDare, getDareFeed, getDareById, updateDareStatus };
