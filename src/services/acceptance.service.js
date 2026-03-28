const prisma = require('../prisma/client');
const { ACCEPTANCE_STATUS_TRANSITIONS } = require('../constants/acceptance.constants');
const { createNotification } = require('./notification.service');

async function acceptDare(dareId, userId) {
  // Dare must exist and be ACTIVE
  const dare = await prisma.dare.findUnique({ where: { id: dareId } });
  if (!dare) {
    const err = new Error('Dare not found');
    err.statusCode = 404;
    throw err;
  }

  if (dare.status !== 'ACTIVE') {
    const err = new Error('Only ACTIVE dares can be accepted');
    err.statusCode = 400;
    throw err;
  }

  // Creator cannot accept their own dare
  if (dare.creatorId === userId) {
    const err = new Error('You cannot accept your own dare');
    err.statusCode = 400;
    throw err;
  }

  // Prevent duplicate acceptance (unique constraint also enforces this at DB level)
  const existing = await prisma.dareAcceptance.findUnique({
    where: { dareId_userId: { dareId, userId } },
  });
  if (existing) {
    const err = new Error('You have already accepted this dare');
    err.statusCode = 409;
    throw err;
  }

  const acceptance = await prisma.dareAcceptance.create({
    data: {
      dareId,
      userId,
      status: 'ACCEPTED',
    },
    include: {
      dare: { select: { id: true, title: true, status: true, rewardAmount: true } },
      user: { select: { id: true, username: true, avatarUrl: true } },
    },
  });

  // Notify the dare creator
  createNotification(
    dare.creatorId,
    'DARE_ACCEPTED',
    `${acceptance.user.username} accepted your dare "${dare.title}"`,
    dare.id,
  );

  return acceptance;
}

async function getAcceptanceById(id) {
  const acceptance = await prisma.dareAcceptance.findUnique({
    where: { id },
    include: {
      dare: { select: { id: true, title: true, status: true, rewardAmount: true } },
      user: { select: { id: true, username: true, avatarUrl: true } },
    },
  });

  return acceptance;
}

async function getDareAcceptances(dareId) {
  const dare = await prisma.dare.findUnique({ where: { id: dareId } });
  if (!dare) {
    const err = new Error('Dare not found');
    err.statusCode = 404;
    throw err;
  }

  const acceptances = await prisma.dareAcceptance.findMany({
    where: { dareId },
    include: {
      user: { select: { id: true, username: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return acceptances;
}

async function updateAcceptanceStatus(id, newStatus) {
  const acceptance = await prisma.dareAcceptance.findUnique({ where: { id } });
  if (!acceptance) return null;

  const allowed = ACCEPTANCE_STATUS_TRANSITIONS[acceptance.status] || [];
  if (!allowed.includes(newStatus)) {
    const err = new Error(`Cannot transition acceptance from ${acceptance.status} to ${newStatus}`);
    err.statusCode = 400;
    throw err;
  }

  return prisma.dareAcceptance.update({
    where: { id },
    data: { status: newStatus },
    include: {
      dare: { select: { id: true, title: true, status: true, rewardAmount: true } },
      user: { select: { id: true, username: true, avatarUrl: true } },
    },
  });
}

module.exports = { acceptDare, getAcceptanceById, getDareAcceptances, updateAcceptanceStatus };
