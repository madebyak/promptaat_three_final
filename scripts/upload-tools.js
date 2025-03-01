const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

async function uploadTools() {
  try {
    console.log('Starting tools upload process...');
    
    // Test connection first
    console.log('Testing database connection...');
    const testResult = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Database connection successful:', testResult);
    
    // Read the tools data file
    const toolsFilePath = path.join(__dirname, '..', 'data-entry', 'tools.json');
    console.log(`Reading tools data from: ${toolsFilePath}`);
    
    const fileContent = fs.readFileSync(toolsFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    console.log(`Found ${data.tools.length} tools to upload`);
    
    // Process each tool
    for (const tool of data.tools) {
      console.log(`Creating tool: ${tool.name}`);
      
      try {
        // Create the tool in the database
        await prisma.tool.create({
          data: {
            name: tool.name,
            iconUrl: tool.iconUrl
          }
        });
        
        console.log(`Successfully created tool: ${tool.name}`);
      } catch (toolError) {
        console.error(`Error creating tool ${tool.name}:`, toolError);
      }
    }
    
    console.log('Tools upload completed successfully!');
    
    // Count the tools in the database
    const toolCount = await prisma.tool.count();
    console.log(`Total tools in database: ${toolCount}`);
    
  } catch (error) {
    console.error('Error during tools upload:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the upload
uploadTools()
  .catch((error) => {
    console.error('Failed to upload tools:', error);
    process.exit(1);
  });
