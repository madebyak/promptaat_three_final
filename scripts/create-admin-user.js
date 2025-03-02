const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/lib/crypto');

const prisma = new PrismaClient();

async function main() {
  // Admin user data
  const email = 'admin@promptaat.com';
  const password = 'Admin123!';
  const name = 'Admin User';
  const role = 'admin';
  
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email },
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash password using Web Crypto API
    const passwordHash = await hashPassword(password);
    
    // Create the admin user
    const admin = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        firstName: name.split(' ')[0],
        lastName: name.split(' ')[1],
        role,
        isActive: true,
      },
    });
    
    console.log('Admin user created successfully:', admin);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
