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
      console.log('❌ Admin user not found in the database');
      return;
    }
    
    console.log('✅ Admin user found in the database');
    console.log('Admin details:');
    console.log('- ID:', admin.id);
    console.log('- Email:', admin.email);
    console.log('- Active:', admin.isActive);
    console.log('- Role:', admin.role);
    console.log('- Last Login:', admin.lastLogin);
    console.log('- Password Hash Length:', admin.passwordHash.length);
    console.log('- Password Hash Prefix:', admin.passwordHash.substring(0, 10) + '...');
    
    // Generate test hashes for comparison
    const testPassword = 'Admin123!';
    const generatedHash = generateHash(testPassword);
    
    console.log('\nPassword Hash Verification:');
    console.log('- Test Password:', testPassword);
    console.log('- Generated Hash:', generatedHash);
    console.log('- Stored Hash:', admin.passwordHash);
    console.log('- Hash Match:', generatedHash === admin.passwordHash ? '✅ YES' : '❌ NO');
    
    if (generatedHash !== admin.passwordHash) {
      console.log('\n❓ Would you like to update the admin password hash? (y/n)');
      process.stdin.once('data', async (data) => {
        const answer = data.toString().trim().toLowerCase();
        if (answer === 'y' || answer === 'yes') {
          await prisma.adminUser.update({
            where: { id: admin.id },
            data: { passwordHash: generatedHash }
          });
          console.log('✅ Admin password hash updated successfully');
        } else {
          console.log('❌ Password hash update cancelled');
        }
        await prisma.$disconnect();
        process.exit(0);
      });
    } else {
      console.log('\n✅ Password hash is already correct');
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
