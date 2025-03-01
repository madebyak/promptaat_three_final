import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * This seed file is for authentication-related data.
 * It's designed to be additive only and will not overwrite existing data.
 */
async function main() {
  console.log('Seeding authentication data...');
  
  // You can add test users or other auth-related data here if needed
  // Example:
  /*
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      passwordHash: '$2b$10$dXMFkSQSWh.Syg/GJwg4XeZkbLNKLCtsVWlmKHfnN7UNI8cJFzn8m', // 'password123'
      country: 'US',
      emailVerified: true,
    },
  });
  console.log('Created test user:', testUser.email);
  */
}

main()
  .catch((e) => {
    console.error('Error seeding authentication data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
