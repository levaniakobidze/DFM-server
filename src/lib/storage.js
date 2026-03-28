const supabase = require('./supabase');

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET;

// Allowed MIME types for proof uploads
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime'];

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;   // 20 MB
const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024;  // 500 MB
// Used by the generic size validator — equals the largest allowed limit
const MAX_FILE_SIZE_BYTES = MAX_VIDEO_SIZE_BYTES;

/**
 * Creates a signed upload URL for a proof file.
 * The client uploads directly to Supabase Storage — the server never handles the binary.
 *
 * @param {string} path - Storage path, e.g. "proofs/<submissionId>/<filename>"
 * @param {number} expiresInSeconds - How long the URL stays valid (default 5 min)
 */
async function createSignedUploadUrl(path, expiresInSeconds = 300) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path, { expiresIn: expiresInSeconds });

  if (error) {
    const err = new Error(`Storage error: ${error.message}`);
    err.statusCode = 500;
    throw err;
  }

  return data; // { signedUrl, token, path }
}

/**
 * Returns the public URL for a stored file.
 */
function getPublicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

module.exports = {
  createSignedUploadUrl,
  getPublicUrl,
  ALLOWED_MIME_TYPES,
  IMAGE_MIME_TYPES,
  VIDEO_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  MAX_FILE_SIZE_BYTES,
};
