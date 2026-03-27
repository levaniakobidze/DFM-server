const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed a test user for local development
  const user = await prisma.user.upsert({
    where: { email: 'dev@dfm.com' },
    update: {},
    create: {
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
