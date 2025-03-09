import { PrismaClient } from '@prisma/client';
import { seedCategories } from './categories';
import { seedTools } from './tools';
import { seedPrompts } from './prompts';
import { seedAdminUsers } from './admin-users';

const prisma = new PrismaClient();

async function main() {
  try {
    // First seed admin users
    await seedAdminUsers();
    
    // Then seed categories
    await seedCategories();

    // Then seed tools
    await seedTools();

    // Finally seed prompts
    await seedPrompts();
  } catch (error) {
    console.error('Error in main seed function:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
