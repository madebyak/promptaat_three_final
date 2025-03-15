// Script to manage subscriptions in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const command = process.argv[2];

  if (command === 'list') {
    // List all subscriptions
    const subscriptions = await prisma.subscription.findMany();
    console.log('Current subscriptions:');
    console.log(JSON.stringify(subscriptions, null, 2));
    console.log(`Total subscriptions: ${subscriptions.length}`);
  } 
  else if (command === 'delete-all') {
    // Delete all subscriptions
    const deleted = await prisma.subscription.deleteMany({});
    console.log(`Deleted ${deleted.count} subscriptions`);
  }
  else if (command === 'delete' && process.argv[3]) {
    // Delete a specific subscription by ID
    const id = process.argv[3];
    await prisma.subscription.delete({
      where: { id }
    });
    console.log(`Deleted subscription with ID: ${id}`);
  }
  else {
    console.log('Usage:');
    console.log('  node manage-subscriptions.js list');
    console.log('  node manage-subscriptions.js delete-all');
    console.log('  node manage-subscriptions.js delete <subscription-id>');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
