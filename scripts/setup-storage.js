/**
 * Run once to create the Supabase Storage bucket used for proof uploads.
 *   node scripts/setup-storage.js
 */
require('dotenv').config();
const supabase = require('../src/lib/supabase');

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET;

async function main() {
  if (!BUCKET) {
    console.error('SUPABASE_STORAGE_BUCKET is not set in .env');
    process.exit(1);
  }

  // Check if bucket already exists
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('Failed to list buckets:', listErr.message);
    process.exit(1);
  }

  const exists = buckets.some((b) => b.name === BUCKET);
  if (exists) {
    console.log(`Bucket "${BUCKET}" already exists — nothing to do.`);
    return;
  }

  // Create the bucket (public so proof URLs work without signed read URLs)
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'],
  });

  if (createErr) {
    console.error('Failed to create bucket:', createErr.message);
    process.exit(1);
  }

  console.log(`Bucket "${BUCKET}" created successfully.`);
}

main();
