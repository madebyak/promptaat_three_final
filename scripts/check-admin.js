// Simple script to check if admin user exists
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Try to find the admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email: 'admin@promptaat.com' }
    });
    
    if (admin) {
      console.log('Admin user found:');
      console.log('Email:', admin.email);
      console.log('First Name:', admin.firstName);
      console.log('Last Name:', admin.lastName);
      console.log('Role:', admin.role);
      console.log('Is Active:', admin.isActive);
      console.log('Created At:', admin.createdAt);
    } else {
      console.log('Admin user not found');
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
