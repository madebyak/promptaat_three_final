const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConnection() {
  try {
    console.log('Attempting to connect to the database...');
    
    // Try a simple query to check connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    
    console.log('Successfully connected to the database!');
    console.log('Connection test result:', result);
    
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:');
    console.error(error);
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkConnection()
  .then(isConnected => {
    if (!isConnected) {
      console.log('\nPossible solutions:');
      console.log('1. Check if your database server is running');
      console.log('2. Verify your DATABASE_URL in the .env file');
      console.log('3. Check if your network allows connections to the database server');
      console.log('4. If using a cloud database, check if your IP is whitelisted');
    }
    process.exit(isConnected ? 0 : 1);
  });
