const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/** Stable ID for local dev — must match app `.env` NEXT_PUBLIC_DEV_CREATOR_ID */
const DEV_SEED_USER_ID = 'a1111111-1111-4111-8111-111111111111';

async function main() {
  console.log('Seeding database...');

  const existing = await prisma.user.findUnique({ where: { email: 'dev@dfm.com' } });
  if (existing) {
    console.log('Seeded user already exists:', existing.email);
    console.log('Set NEXT_PUBLIC_DEV_CREATOR_ID to:', existing.id);
    return;
  }

  const user = await prisma.user.create({
    data: {
      id: DEV_SEED_USER_ID,
      email: 'dev@dfm.com',
      username: 'devuser',
      profile: {
        create: {
          displayName: 'Dev User',
          bio: 'Seed account for local development',
        },
      },
    },
  });

  console.log('Seeded user:', user.email);
  console.log('Set NEXT_PUBLIC_DEV_CREATOR_ID to:', user.id);
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
