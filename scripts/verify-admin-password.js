const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Simple password hashing function matching our updated crypto.ts
function hashPasswordSync(password) {
  const salt = 'promptaat-static-salt'; // Using the same static salt as in crypto.ts
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

async function main() {
  try {
    // Check if admin exists
    const admin = await prisma.adminUser.findUnique({
      where: { email: 'admin@promptaat.com' }
    });
    
    if (!admin) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:');
    console.log('Email:', admin.email);
    console.log('Current password hash:', admin.passwordHash);
    
    // Test password
    const testPassword = 'Admin123!';
    const correctHash = hashPasswordSync(testPassword);
    
    console.log('Test password:', testPassword);
    console.log('Correct hash should be:', correctHash);
    console.log('Hash match?', admin.passwordHash === correctHash);
    
    // Update the password if it doesn't match
    if (admin.passwordHash !== correctHash) {
      console.log('Updating admin password hash...');
      
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { passwordHash: correctHash }
      });
      
      console.log('Password hash updated successfully');
    } else {
      console.log('Password hash is already correct');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
