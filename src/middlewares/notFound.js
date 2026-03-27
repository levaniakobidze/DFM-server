const { sendError } = require('../utils/response');

// Catches any request that didn't match a registered route
function notFound(req, res) {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

module.exports = notFound;
