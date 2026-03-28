const { createClient } = require('@supabase/supabase-js');

// Service-role client — used server-side only for JWT verification and Storage
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

module.exports = supabase;
