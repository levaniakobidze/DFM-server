// Valid status transitions for a Submission.
// Key = current status, Value = statuses it can move to.
// Actual approve/reject transitions are handled in Phase 6.
const SUBMISSION_STATUS_TRANSITIONS = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: [],
  REJECTED: [],
};

const SUBMISSION_DEFAULT_PAGE_SIZE = 10;
const SUBMISSION_MAX_PAGE_SIZE = 50;

module.exports = {
  SUBMISSION_STATUS_TRANSITIONS,
  SUBMISSION_DEFAULT_PAGE_SIZE,
  SUBMISSION_MAX_PAGE_SIZE,
};
