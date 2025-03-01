const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listTools() {
  try {
    console.log('Listing all tools in the database...');
    
    // Get all tools
    const tools = await prisma.tool.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`Found ${tools.length} tools:`);
    console.log('======================');
    
    // Display each tool with its details
    for (const tool of tools) {
      console.log(`Name: ${tool.name}`);
      console.log(`Icon URL: ${tool.iconUrl || 'None'}`);
      console.log(`Created: ${tool.createdAt}`);
      console.log('----------------------');
    }
    
  } catch (error) {
    console.error('Error listing tools:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the list function
listTools()
  .catch(error => {
    console.error('Failed to list tools:', error);
    process.exit(1);
  });
