const supabase = require('../lib/supabase');
const prisma = require('../prisma/client');
const { sendError } = require('../utils/response');

/**
 * Verifies the Supabase JWT from the Authorization header and attaches
 * the DB user to req.user. On first login the user row is created automatically.
 *
 * Routes that need a user but should not hard-fail (e.g. public reads) can
 * use this middleware in "optional" mode — see requireAuth for hard protection.
 */
async function attachUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // no token — req.user stays undefined
  }

  const token = authHeader.slice(7);

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return next(); // invalid token — treat as unauthenticated
  }

  const supabaseUser = data.user;

  // Sync Supabase user → DB on first login
  let dbUser = await prisma.user.findUnique({ where: { id: supabaseUser.id } });

  if (!dbUser) {
    const email = supabaseUser.email;
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

    dbUser = await prisma.user.upsert({
      where: { id: supabaseUser.id },
      update: {},
      create: {
        id: supabaseUser.id,
        email,
        username,
        profile: {
          create: {
            displayName: supabaseUser.user_metadata?.full_name || username,
            bio: null,
          },
        },
      },
    });
  }

  req.user = dbUser;
  next();
}

/**
 * Hard guard — must come after attachUser.
 * Rejects the request with 401 if no authenticated user is present.
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }
  next();
}

module.exports = { attachUser, requireAuth };
