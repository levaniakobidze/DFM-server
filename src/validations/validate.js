const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

// Drop this after your express-validator rule chains in any route.
// It collects errors and short-circuits with a 400 if any exist.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 400, errors.array());
  }
  next();
}

module.exports = validate;
