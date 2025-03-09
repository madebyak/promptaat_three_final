const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Simple password hashing function for admin creation
function hashPasswordSync(password) {
  const salt = 'promptaat-static-salt'; // Using a static salt for simplicity
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

async function main() {
  // Admin user data
  const email = 'admin@promptaat.com';
  const password = 'Admin123!';
  const firstName = 'Admin';
  const lastName = 'User';
  const role = 'admin';
  
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email },
    });
    
    if (existingAdmin) {
      console.log(`Admin user with email ${email} already exists.`);
      return;
    }
    
    // Hash password
    const passwordHash = hashPasswordSync(password);
    
    // Create the admin user
    const admin = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        isActive: true,
      },
    });
    
    console.log(`Admin user created successfully with ID: ${admin.id}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
