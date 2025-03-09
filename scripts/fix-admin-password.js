import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Generate hash using the exact same method as in the API route
function generateHash(password) {
  const salt = 'promptaat-static-salt';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

async function main() {
  try {
    // Find the admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email: 'admin@promptaat.com' }
    });
    
    if (!admin) {
      console.log('Admin user not found');
      return;
    }
    
    // Generate the correct hash for the password
    const password = 'Admin123!';
    const correctHash = generateHash(password);
    
    console.log('Current admin hash:', admin.passwordHash);
    console.log('Correct hash should be:', correctHash);
    
    // Update the admin user with the correct hash
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: correctHash }
    });
    
    console.log('Admin password updated successfully');
    console.log('You can now log in with:');
    console.log('Email: admin@promptaat.com');
    console.log('Password: Admin123!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
