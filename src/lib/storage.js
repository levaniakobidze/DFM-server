const supabase = require('./supabase');

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET;

// Allowed MIME types and max file size for proof uploads
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

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

module.exports = { createSignedUploadUrl, getPublicUrl, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES };
