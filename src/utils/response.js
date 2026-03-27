// Consistent JSON response helpers — matches the shape defined in API_RULES.md

function sendSuccess(res, message, data = null, statusCode = 200) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
}

function sendError(res, message, statusCode = 500, errors = null) {
  const body = { success: false, message };
  if (errors !== null) body.errors = errors;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };
