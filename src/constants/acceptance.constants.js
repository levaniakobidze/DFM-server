// Valid status transitions for a DareAcceptance.
// Key = current status, Value = statuses it can move to.
const ACCEPTANCE_STATUS_TRANSITIONS = {
  ACCEPTED: ['CANCELLED', 'SUBMITTED'],
  CANCELLED: [],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: [],
  REJECTED: [],
};

module.exports = { ACCEPTANCE_STATUS_TRANSITIONS };
