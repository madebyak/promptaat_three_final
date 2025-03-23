import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: 'ahmedsam779@gmail.com' },
      include: {
        subscriptions: true,
      }
    });

    console.log('User record:', JSON.stringify(user, null, 2));
    
    // Check all users to see if the user might be listed under a different email
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        role: true,
        googleId: true,
        emailVerified: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Get the 10 most recent users
    });
    
    console.log('Recent users:', JSON.stringify(allUsers, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
