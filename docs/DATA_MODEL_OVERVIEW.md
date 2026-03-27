
---

# 5) `backend/docs/DATA_MODEL_OVERVIEW.md`

```md
# Data Model Overview

## Core Entities

### User
Represents a platform user.
Auth may later be connected through Supabase Auth.

Possible fields:
- id
- email
- username
- avatarUrl
- createdAt
- updatedAt

---

### Profile
Stores user-facing profile details.

Possible fields:
- userId
- displayName
- bio
- stats
- wallet-related summary fields later if needed

---

### Dare
Represents a paid challenge created by a user.

Possible fields:
- id
- creatorId
- title
- description
- category
- rewardAmount
- proofType
- status
- createdAt
- updatedAt
- expiresAt

Possible statuses:
- DRAFT
- ACTIVE
- CLOSED
- COMPLETED
- REJECTED
- CANCELLED

---

### DareAcceptance
Represents a user accepting a dare.

Possible fields:
- id
- dareId
- userId
- status
- createdAt
- updatedAt

Possible statuses:
- ACCEPTED
- CANCELLED
- SUBMITTED
- APPROVED
- REJECTED

---

### Submission
Represents proof uploaded for a dare.

Possible fields:
- id
- dareId
- acceptanceId
- userId
- proofUrl
- proofType
- note
- status
- createdAt
- updatedAt

Possible statuses:
- PENDING
- APPROVED
- REJECTED

---

### Report
Represents a flagged dare or submission.

Possible fields:
- id
- reporterId
- targetType
- targetId
- reason
- status
- createdAt

Possible target types:
- DARE
- SUBMISSION

Possible statuses:
- OPEN
- REVIEWED
- DISMISSED

---

### Transaction
Represents wallet-related money movement.

Possible fields:
- id
- userId
- type
- amount
- status
- relatedDareId
- relatedSubmissionId
- createdAt

Possible types:
- REWARD_PENDING
- REWARD_RELEASED
- REWARD_REVERSED
- WITHDRAWAL
- ADJUSTMENT

Possible statuses:
- PENDING
- COMPLETED
- FAILED

---

## MVP Notes
For MVP:
- keep schema simple
- avoid too many optional advanced tables
- focus on dare, acceptance, submission, transaction foundations first
- keep moderation and wallet expansion possible later