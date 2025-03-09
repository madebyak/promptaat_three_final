// Simple JavaScript seed script for admin users
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Admin users to seed
const adminUsers = [
  {
    email: 'admin@promptaat.com',
    password: 'Admin@2025!',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'super_admin',
  },
  {
    email: 'adminahmed@promptaat.com',
    password: 'admiN@123#',
    firstName: 'Ahmed',
    lastName: 'Admin',
    role: 'admin',
  }
];

// Simple hash function to match the project's crypto.ts implementation
async function hashPassword(password) {
  // Add a static salt to make the hash more secure (matching the crypto.ts implementation)
  const saltedPassword = `${password}__promptaat_salt__`;
  
  // Create SHA-256 hash
  const hash = crypto.createHash('sha256');
  hash.update(saltedPassword);
  return hash.digest('hex');
}

async function main() {
  console.log('Start seeding admin users...');
  
  for (const admin of adminUsers) {
    try {
      // Hash the password
      const passwordHash = await hashPassword(admin.password);
      
      // Check if admin already exists
      const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: admin.email }
      });
      
      if (existingAdmin) {
        console.log(`Admin user ${admin.email} already exists, skipping...`);
        continue;
      }
      
      // Create the admin user
      const createdAdmin = await prisma.adminUser.create({
        data: {
          email: admin.email,
          passwordHash: passwordHash,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          isActive: true
        }
      });
      
      console.log(`Created admin user: ${createdAdmin.email} with role: ${createdAdmin.role}`);
    } catch (error) {
      console.error(`Error creating admin user ${admin.email}:`, error);
    }
  }
  
  console.log('Admin user seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
