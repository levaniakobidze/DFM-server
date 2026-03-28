const prisma = require('../prisma/client');

// Paths to skip (noisy / internal)
const SKIP_PATHS = ['/api/health'];

/**
 * Fire-and-forget middleware that logs every API request to the RequestLog table.
 * Does not block the response — errors are silently swallowed.
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const path = req.originalUrl || req.path;
    if (!path.startsWith('/api')) return;
    if (SKIP_PATHS.some((p) => path.startsWith(p))) return;

    const duration = Date.now() - start;
    const rawIp = req.headers['x-forwarded-for'] || req.ip || '';
    const ip = rawIp.toString().split(',')[0].trim().replace('::1', '127.0.0.1') || null;

    if (!prisma.requestLog) return;

    prisma.requestLog
      .create({
        data: {
          method: req.method,
          path,
          statusCode: res.statusCode,
          userId: req.user?.id ?? null,
          username: req.user?.username ?? null,
          ip,
          userAgent: req.headers['user-agent'] ?? null,
          duration,
        },
      })
      .catch(() => {}); // fire-and-forget
  });

  next();
}

module.exports = requestLogger;
