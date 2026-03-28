# Payment Setup (Paddle)

This project uses [Paddle](https://developer.paddle.com/) for one-time payments. The integration is built on the **Paddle Node.js SDK** (`@paddle/paddle-node-sdk`).

---

## Environment Variables

| Variable | Where to find it | Required |
|---|---|---|
| `PADDLE_API_KEY` | Paddle dashboard → Developer → Authentication → API keys | Yes |
| `PADDLE_WEBHOOK_SECRET` | Paddle dashboard → Developer → Webhooks → (your endpoint) → secret key | Yes |
| `PADDLE_PRODUCT_ID` | Paddle dashboard → Catalog → Products → create a product, copy the `pro_…` ID | Yes |

Use **sandbox** credentials during development (`NODE_ENV=development`) and **live** credentials in production (`NODE_ENV=production`). The config module (`src/lib/paddle.js`) switches environments automatically based on `NODE_ENV`.

---

## Payment Flow

```
Client                    Server                     Paddle
  │                          │                          │
  │  POST /api/payments/checkout                        │
  │  { dareId, amount }       │                          │
  │─────────────────────────>│                          │
  │                          │  transactions.create()   │
  │                          │─────────────────────────>│
  │                          │<─────────────────────────│
  │                          │  { id, checkout.url }    │
  │  { transactionId,        │                          │
  │    checkoutUrl }         │                          │
  │<─────────────────────────│                          │
  │                          │                          │
  │  Paddle.js overlay (transactionId)                  │
  │──────────────────────────────────────────────────── │
  │  User completes payment                             │
  │                          │                          │
  │                          │  POST /api/payments/webhook
  │                          │<─────────────────────────│
  │                          │  Verify signature         │
  │                          │  Update Payment → COMPLETED
  │                          │  Create REWARD_PENDING Transaction
  │                          │  200 OK                  │
  │                          │─────────────────────────>│
```

1. **Checkout** — `POST /api/payments/checkout` creates a Paddle transaction and immediately records a `Payment` row with `status: PENDING` in the database, linked to the dare and the paying user.
2. **Frontend** — receives the `transactionId` and opens the Paddle JS overlay (or redirects to `checkoutUrl`).
3. **Webhook** — on `transaction.completed`, the payment row is updated to `COMPLETED` and a `REWARD_PENDING` transaction is written so the dare has funded balance available for the winner.
4. **Failure** — on `transaction.payment_failed`, the payment row is updated to `FAILED`.

---

## Webhook Setup

1. Go to **Paddle Dashboard → Developer → Webhooks** and add a new endpoint.
2. Set the URL to `https://your-domain.com/api/payments/webhook`.
3. Subscribe to at minimum: `transaction.completed`, `transaction.payment_failed`.
4. Copy the **secret key** and set it as `PADDLE_WEBHOOK_SECRET`.

The raw request body is preserved before `express.json()` runs so that Paddle's HMAC signature can be verified correctly. See `src/app.js`.

---

## Price Setup

No catalog **price** is required — dare amounts are fully dynamic. However, Paddle does not allow creating a product entirely inline inside a transaction, so you need one catalog **product** created in the Paddle dashboard:

1. Go to **Catalog → Products → New product**
2. Name: `Dare Funding`, Tax category: `Standard`
3. Save and copy the `pro_…` ID into `PADDLE_PRODUCT_ID`

Each dare checkout creates a fresh non-catalog price attached to this product with the exact dare reward amount.

---

## Prisma Models

| Model | Purpose |
|---|---|
| `Payment` | One row per Paddle transaction. Tracks `paddleTransactionId`, `amount`, `currency`, `status`, and links to both `User` and `Dare`. |
| `PayoutDetail` | Stores a user's preferred payout method for future winner payouts (see below). |

---

## Payouts / Bank Accounts — Current Limitations

**Direct bank account payouts to winners are not implemented.** Paddle's API does not expose a general-purpose bank-transfer payout endpoint; payouts in Paddle are handled through their own vendor/seller settlement process, not via API calls to arbitrary recipients.

What is implemented today is a **foundation**:

- `PayoutDetail` model: stores a user's preferred payout `method` (`bank_transfer`, `paypal`, `wise`) and a freeform `details` JSON blob.
- `PUT /api/payments/payout-detail` — lets users register their preferred method.
- `GET /api/payments/payout-detail` — returns metadata only (`method`, `verified`, `hasDetails`); raw bank details are never sent to the client.
- The `verified` flag defaults to `false` and is reserved for a future manual or automated verification step.

**When payouts are ready to implement**, the path is:
1. Choose a payout provider (e.g. Wise, Stripe Connect, Hyperwallet, or manual bank transfer).
2. Integrate that provider's API using the data already stored in `PayoutDetail`.
3. Trigger the payout when a `Submission` is approved and the related `REWARD_PENDING` transaction exists.

> **Security note:** The `details` JSON column should be encrypted at rest before going to production. Do not store full account numbers in plaintext.
