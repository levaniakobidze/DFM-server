const prisma = require('../prisma/client');
const {
  REPORT_DEFAULT_PAGE_SIZE,
  REPORT_MAX_PAGE_SIZE,
} = require('../constants/report.constants');

async function createReport(data) {
  const { reporterId, targetType, targetId, reason } = data;

  // Verify the reporter exists
  const reporter = await prisma.user.findUnique({ where: { id: reporterId } });
  if (!reporter) {
    const err = new Error('Reporter user not found');
    err.statusCode = 404;
    throw err;
  }

  // Verify the target exists
  if (targetType === 'DARE') {
    const dare = await prisma.dare.findUnique({ where: { id: targetId } });
    if (!dare) {
      const err = new Error('Dare not found');
      err.statusCode = 404;
      throw err;
    }
  } else if (targetType === 'SUBMISSION') {
    const submission = await prisma.submission.findUnique({ where: { id: targetId } });
    if (!submission) {
      const err = new Error('Submission not found');
      err.statusCode = 404;
      throw err;
    }
  }

  const report = await prisma.report.create({
    data: {
      reporterId,
      targetType,
      targetId,
      reason,
      status: 'OPEN',
    },
    include: {
      reporter: { select: { id: true, username: true } },
    },
  });

  return report;
}

async function getReportById(id) {
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      reporter: { select: { id: true, username: true } },
    },
  });

  return report;
}

async function listReports({ status, targetType, page, limit }) {
  const pageNum = parseInt(page) || 1;
  const pageSize = Math.min(parseInt(limit) || REPORT_DEFAULT_PAGE_SIZE, REPORT_MAX_PAGE_SIZE);
  const skip = (pageNum - 1) * pageSize;

  const where = {};
  if (status) where.status = status;
  else where.status = 'OPEN'; // default to the moderation queue (open reports)
  if (targetType) where.targetType = targetType;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, username: true } },
      },
    }),
    prisma.report.count({ where }),
  ]);

  return {
    reports,
    pagination: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

module.exports = { createReport, getReportById, listReports };
