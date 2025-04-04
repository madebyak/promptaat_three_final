import { PrismaClient as AdminPrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/crypto';

const adminPrisma = new AdminPrismaClient();

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
]

async function main() {
  console.log('Start seeding admin users...')
  
  for (const admin of adminUsers) {
    // Hash the password using the project's custom implementation
    const passwordHash = await hashPassword(admin.password)
    
    // Check if admin already exists
    const existingAdmin = await adminPrisma.adminUser.findUnique({
      where: { email: admin.email }
    })
    
    if (existingAdmin) {
      console.log(`Admin user ${admin.email} already exists, skipping...`)
      continue
    }
    
    // Create the admin user
    const createdAdmin = await adminPrisma.adminUser.create({
      data: {
        email: admin.email,
        passwordHash: passwordHash,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        isActive: true
      }
    })
    
    console.log(`Created admin user: ${createdAdmin.email} with role: ${createdAdmin.role}`)
  }
  
  console.log('Admin user seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await adminPrisma.$disconnect()
  })

export default main;
