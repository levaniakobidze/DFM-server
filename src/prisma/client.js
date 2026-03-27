const { PrismaClient } = require('@prisma/client');

// Singleton — reuse the same client across the app
const prisma = new PrismaClient();

module.exports = prisma;
