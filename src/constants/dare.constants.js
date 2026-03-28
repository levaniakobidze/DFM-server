// Valid status transitions for a Dare.
// Key = current status, Value = statuses it can move to.
const DARE_STATUS_TRANSITIONS = {
  DRAFT: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['CLOSED', 'CANCELLED', 'COMPLETED'],
  CLOSED: ['COMPLETED', 'REJECTED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

const DARE_SORT_FIELDS = {
  newest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  reward_high: { rewardAmount: 'desc' },
  reward_low: { rewardAmount: 'asc' },
};

const DARE_DEFAULT_PAGE_SIZE = 10;
const DARE_MAX_PAGE_SIZE = 50;

module.exports = {
  DARE_STATUS_TRANSITIONS,
  DARE_SORT_FIELDS,
  DARE_DEFAULT_PAGE_SIZE,
  DARE_MAX_PAGE_SIZE,
};
