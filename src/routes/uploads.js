const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../validations/validate');
const { attachUser, requireAuth } = require('../middlewares/auth');
const {
  createSignedUploadUrl,
  getPublicUrl,
  ALLOWED_MIME_TYPES,
  IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  MAX_FILE_SIZE_BYTES,
} = require('../lib/storage');
const { sendSuccess, sendError } = require('../utils/response');
const prisma = require('../prisma/client');

const router = Router();

/**
 * POST /api/uploads/proof-url
 * Returns a short-lived signed upload URL so the client can PUT the file
 * directly to Supabase Storage without routing binary data through this server.
 *
 * Body: { acceptanceId, filename, mimeType, size }
 *
 * Security: verifies the authenticated user owns the acceptance before
 * issuing a signed URL.
 */
router.post(
  '/proof-url',
  attachUser,
  requireAuth,
  [
    body('acceptanceId')
      .notEmpty().withMessage('acceptanceId is required')
      .isUUID().withMessage('acceptanceId must be a valid UUID'),

    body('filename')
      .notEmpty().withMessage('filename is required')
      .isString()
      .isLength({ max: 200 }).withMessage('filename must be at most 200 characters'),

    body('mimeType')
      .notEmpty().withMessage('mimeType is required')
      .isIn(ALLOWED_MIME_TYPES).withMessage(`mimeType must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`),

    body('size')
      .notEmpty().withMessage('size is required')
      .isInt({ min: 1 }).withMessage('size must be a positive integer')
      .custom((value, { req }) => {
        const bytes = parseInt(value);
        const isImage = IMAGE_MIME_TYPES.includes(req.body?.mimeType);
        const limit = isImage ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
        if (bytes > limit) {
          throw new Error(`File size must not exceed ${limit / (1024 * 1024)} MB for ${isImage ? 'images' : 'videos'}`);
        }
        return true;
      }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { acceptanceId, filename } = req.body;

      // Verify the acceptance exists and belongs to the authenticated user
      const acceptance = await prisma.dareAcceptance.findUnique({
        where: { id: acceptanceId },
      });

      if (!acceptance) {
        return sendError(res, 'Acceptance not found', 404);
      }

      if (acceptance.userId !== req.user.id) {
        return sendError(res, 'You can only upload proof for your own accepted dares', 403);
      }

      if (!['ACCEPTED', 'SUBMITTED'].includes(acceptance.status)) {
        return sendError(res, `Cannot upload proof for an acceptance with status ${acceptance.status}`, 400);
      }

      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `proofs/${acceptanceId}/${Date.now()}_${safeName}`;

      const uploadData = await createSignedUploadUrl(storagePath);
      const publicUrl = getPublicUrl(storagePath);

      return sendSuccess(res, 'Signed upload URL created', {
        signedUrl: uploadData.signedUrl,
        path: storagePath,
        publicUrl,
        expiresInSeconds: 300,
      }, 201);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
