const paddle = require('../lib/paddle');
const prisma = require('../prisma/client');

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;
const PRODUCT_ID = process.env.PADDLE_PRODUCT_ID;

/**
 * Creates a Paddle transaction for funding a dare.
 *
 * Returns a { transactionId, checkoutUrl } object.
 * The frontend uses the transactionId to open Paddle's JS overlay,
 * or can redirect to checkoutUrl if preferred.
 *
 * @param {object} params
 * @param {string} params.userId        - DB user id
 * @param {string} params.email         - user's email (pre-fills Paddle checkout)
 * @param {string} params.dareId        - dare being funded
 * @param {number} params.amount        - amount in major currency units (e.g. 10.00)
 * @param {string} [params.currency]    - ISO currency code, defaults to USD
 * @param {string} [params.returnUrl]   - URL to redirect to after successful payment
 */
async function createCheckout({ userId, email, dareId, amount, currency = 'USD', returnUrl }) {
  // Confirm the dare exists and belongs to this user
  const dare = await prisma.dare.findUnique({ where: { id: dareId } });
  if (!dare) {
    const err = new Error('Dare not found');
    err.statusCode = 404;
    throw err;
  }
  if (dare.creatorId !== userId) {
    const err = new Error('You can only fund your own dares');
    err.statusCode = 403;
    throw err;
  }

  // Convert amount to smallest currency unit (cents) as a string for Paddle
  const unitPriceAmount = String(Math.round(amount * 100));

  let transaction;
  try {
    transaction = await paddle.transactions.create({
      items: [
        {
          price: {
            description: `Dare funding: ${dare.title}`,
            unitPrice: {
              amount: unitPriceAmount,
              currencyCode: currency.toUpperCase(),
            },
            taxMode: 'account_setting',
            productId: PRODUCT_ID,
          },
          quantity: 1,
        },
      ],
      customData: { userId, dareId },
      customer: { email },
    });
  } catch (paddleErr) {
    console.error('[Paddle] transaction.create failed:', JSON.stringify(paddleErr, null, 2));
    throw paddleErr;
  }

  // Record the payment as PENDING in our DB immediately
  await prisma.payment.create({
    data: {
      userId,
      dareId,
      paddleTransactionId: transaction.id,
      amount,
      currency: currency.toUpperCase(),
      status: 'PENDING',
    },
  });

  return {
    transactionId: transaction.id,
    checkoutUrl: transaction.checkout?.url ?? null,
  };
}

/**
 * Handles incoming Paddle webhook events.
 * Verifies the signature, then dispatches to the right handler.
 *
 * @param {string} rawBody   - raw request body string (must not be parsed)
 * @param {string} signature - value of the Paddle-Signature header
 */
async function handleWebhook(rawBody, signature) {
  // Verify the webhook came from Paddle
  const eventData = paddle.webhooks.unmarshal(rawBody, WEBHOOK_SECRET, signature);

  if (!eventData) {
    const err = new Error('Invalid webhook signature');
    err.statusCode = 400;
    throw err;
  }

  switch (eventData.eventType) {
    case 'transaction.completed':
      await onTransactionCompleted(eventData.data);
      break;

    case 'transaction.payment_failed':
      await onTransactionFailed(eventData.data);
      break;

    // Log unhandled events — don't error, Paddle expects 200
    default:
      console.log(`[Paddle webhook] Unhandled event: ${eventData.eventType}`);
  }
}

async function onTransactionCompleted(txData) {
  const payment = await prisma.payment.findUnique({
    where: { paddleTransactionId: txData.id },
  });

  if (!payment) {
    // Possibly created outside this system — log and skip
    console.warn(`[Paddle webhook] Payment not found for transaction ${txData.id}`);
    return;
  }

  if (payment.status === 'COMPLETED') return; // idempotent

  const paddleCustomerId = txData.customerId ?? null;
  const amount = payment.amount;
  const dareId = payment.dareId;
  const userId = payment.userId;

  await prisma.$transaction([
    // Mark the payment completed and capture the Paddle customer id
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED', paddleCustomerId },
    }),

    // Activate the dare now that it is funded — moves it from DRAFT to ACTIVE
    // so it appears in the feed and can be accepted by other users.
    prisma.dare.update({
      where: { id: dareId },
      data: { status: 'ACTIVE' },
    }),

    // Create a REWARD_PENDING Transaction so the dare has funded balance.
    // This will be released to the winner when a submission is approved.
    prisma.transaction.create({
      data: {
        userId,
        type: 'REWARD_PENDING',
        amount,
        status: 'PENDING',
        relatedDareId: dareId,
      },
    }),
  ]);
}

async function onTransactionFailed(txData) {
  await prisma.payment.updateMany({
    where: { paddleTransactionId: txData.id, status: 'PENDING' },
    data: { status: 'FAILED' },
  });
}

/**
 * Returns a paginated list of the user's payments.
 */
async function listMyPayments(userId, { page = 1 } = {}) {
  const PAGE_SIZE = 10;
  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * PAGE_SIZE;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      include: { dare: { select: { id: true, title: true } } },
    }),
    prisma.payment.count({ where: { userId } }),
  ]);

  return {
    payments,
    pagination: { total, page: pageNum, limit: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) },
  };
}

/**
 * Saves or updates the user's payout detail preference.
 * Foundation only — no live payout system is connected yet.
 */
async function savePayoutDetail(userId, { method, details }) {
  return prisma.payoutDetail.upsert({
    where: { userId },
    update: { method, details, verified: false },
    create: { userId, method, details, verified: false },
  });
}

/**
 * Returns the user's stored payout detail (redacted for safety).
 */
async function getPayoutDetail(userId) {
  const detail = await prisma.payoutDetail.findUnique({ where: { userId } });
  if (!detail) return null;
  // Never return raw bank details to the client — only surface metadata
  return {
    id: detail.id,
    method: detail.method,
    verified: detail.verified,
    createdAt: detail.createdAt,
    hasDetails: !!detail.details,
  };
}

module.exports = {
  createCheckout,
  handleWebhook,
  listMyPayments,
  savePayoutDetail,
  getPayoutDetail,
};
