const prisma = require('../prisma/client');
const {
  SUBMISSION_STATUS_TRANSITIONS,
  SUBMISSION_DEFAULT_PAGE_SIZE,
  SUBMISSION_MAX_PAGE_SIZE,
} = require('../constants/submission.constants');

async function createSubmission(data) {
  const { acceptanceId, userId, proofUrl, proofType, note } = data;

  // Acceptance must exist
  const acceptance = await prisma.dareAcceptance.findUnique({
    where: { id: acceptanceId },
    include: { dare: true },
  });

  if (!acceptance) {
    const err = new Error('Acceptance not found');
    err.statusCode = 404;
    throw err;
  }

  // Only the user who accepted the dare can submit
  if (acceptance.userId !== userId) {
    const err = new Error('You can only submit for your own accepted dare');
    err.statusCode = 403;
    throw err;
  }

  // Acceptance must be in ACCEPTED status to submit
  if (acceptance.status !== 'ACCEPTED') {
    const err = new Error(`Cannot submit for an acceptance with status ${acceptance.status}`);
    err.statusCode = 400;
    throw err;
  }

  // The dare itself must still be ACTIVE
  if (acceptance.dare.status !== 'ACTIVE') {
    const err = new Error('Cannot submit for a dare that is no longer ACTIVE');
    err.statusCode = 400;
    throw err;
  }

  // Create submission and update acceptance status to SUBMITTED atomically
  const [submission] = await prisma.$transaction([
    prisma.submission.create({
      data: {
        dareId: acceptance.dareId,
        acceptanceId,
        userId,
        proofUrl: proofUrl || null,
        proofType: proofType || 'PHOTO',
        note: note || null,
        status: 'PENDING',
      },
      include: {
        dare: { select: { id: true, title: true, rewardAmount: true } },
        user: { select: { id: true, username: true, avatarUrl: true } },
        acceptance: { select: { id: true, status: true } },
      },
    }),
    prisma.dareAcceptance.update({
      where: { id: acceptanceId },
      data: { status: 'SUBMITTED' },
    }),
  ]);

  return submission;
}

async function getSubmissionById(id) {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      dare: { select: { id: true, title: true, rewardAmount: true } },
      user: { select: { id: true, username: true, avatarUrl: true } },
      acceptance: { select: { id: true, status: true } },
    },
  });

  return submission;
}

async function listSubmissions({ userId, dareId, status, page, limit }) {
  const pageNum = parseInt(page) || 1;
  const pageSize = Math.min(parseInt(limit) || SUBMISSION_DEFAULT_PAGE_SIZE, SUBMISSION_MAX_PAGE_SIZE);
  const skip = (pageNum - 1) * pageSize;

  const where = {};
  if (userId) where.userId = userId;
  if (dareId) where.dareId = dareId;
  if (status) where.status = status;

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

  return {
    submissions,
    pagination: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

async function updateSubmissionStatus(id, newStatus) {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { acceptance: true },
  });

  if (!submission) return null;

  const allowed = SUBMISSION_STATUS_TRANSITIONS[submission.status] || [];
  if (!allowed.includes(newStatus)) {
    const err = new Error(`Cannot transition submission from ${submission.status} to ${newStatus}`);
    err.statusCode = 400;
    throw err;
  }

  // Sync acceptance status and optionally close the dare atomically
  const ops = [
    prisma.submission.update({
      where: { id },
      data: { status: newStatus },
      include: {
        dare: { select: { id: true, title: true, rewardAmount: true } },
        user: { select: { id: true, username: true, avatarUrl: true } },
        acceptance: { select: { id: true, status: true } },
      },
    }),
    prisma.dareAcceptance.update({
      where: { id: submission.acceptanceId },
      data: { status: newStatus },
    }),
  ];

  // Approving a submission completes the dare — no further acceptances allowed
  if (newStatus === 'APPROVED') {
    ops.push(
      prisma.dare.update({
        where: { id: submission.dareId },
        data: { status: 'COMPLETED' },
      })
    );
  }

  const [updated] = await prisma.$transaction(ops);
  return updated;
}

module.exports = { createSubmission, getSubmissionById, listSubmissions, updateSubmissionStatus };
