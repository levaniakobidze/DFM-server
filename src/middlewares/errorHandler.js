const { sendError } = require('../utils/response');

// Centralized error handler — must be registered last in app.js
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log in development so we can debug easily
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err);
  }

  return sendError(res, message, statusCode);
}

module.exports = errorHandler;
