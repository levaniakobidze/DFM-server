const { Router } = require('express');
const { body, param } = require('express-validator');
const validate = require('../validations/validate');
const { requireAuth } = require('../middlewares/auth');
const { createSignedUploadUrl, getPublicUrl, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } = require('../lib/storage');
const { sendSuccess, sendError } = require('../utils/response');

const router = Router();

/**
 * POST /api/uploads/proof-url
 * Returns a short-lived signed upload URL so the client can PUT the file
 * directly to Supabase Storage without routing binary data through this server.
 *
 * Body: { submissionId, filename, mimeType, size }
 */
router.post(
  '/proof-url',
  requireAuth,
  [
    body('submissionId')
      .notEmpty().withMessage('submissionId is required')
      .isUUID().withMessage('submissionId must be a valid UUID'),

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
      .custom((value) => {
        if (parseInt(value) > MAX_FILE_SIZE_BYTES) {
          throw new Error(`File size must not exceed ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`);
        }
        return true;
      }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { submissionId, filename } = req.body;
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `proofs/${submissionId}/${Date.now()}_${safeName}`;

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
