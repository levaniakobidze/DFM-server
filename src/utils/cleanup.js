const prisma = require('../prisma/client');

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const INTERVAL_MS = 24 * 60 * 60 * 1000; // run once per day

async function deleteOldRequestLogs() {
  if (!prisma.requestLog) return;
  try {
    const cutoff = new Date(Date.now() - ONE_WEEK_MS);
    const { count } = await prisma.requestLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (count > 0) console.log(`[cleanup] Deleted ${count} request logs older than 7 days`);
  } catch (err) {
    console.error('[cleanup] Failed to delete old request logs:', err.message);
  }
}

function startCleanupJob() {
  deleteOldRequestLogs(); // run immediately on startup
  setInterval(deleteOldRequestLogs, INTERVAL_MS);
}

module.exports = { startCleanupJob };
