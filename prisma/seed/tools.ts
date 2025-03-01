import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ToolData {
  name: string;
  iconUrl: string;
}

async function seedTools() {
  try {
    console.log('Starting tools seeding...');

    // Read the tools data file
    const toolsFile = path.join(process.cwd(), 'docs', 'tools_data_entry.md');
    const fileContent = fs.readFileSync(toolsFile, 'utf8');
    
    // Extract tool blocks
    const toolBlocks = fileContent.split('##').slice(1); // Skip the header

    for (const block of toolBlocks) {
      const lines = block.trim().split('\n');
      const name = lines[0].trim().slice(3); // Remove the numbering
      
      // Extract icon URL
      const iconUrlLine = lines.find(line => line.includes('iconUrl'));
      const iconUrl = iconUrlLine?.split(':')[1].trim() || '';

      // Create or update tool
      const tool = await prisma.tool.upsert({
        where: {
          name: name
        },
        update: {
          iconUrl: iconUrl
        },
        create: {
          name,
          iconUrl
        }
      });

      console.log(`Upserted tool: ${tool.name}`);
    }

    console.log('Tools seeding completed successfully');
  } catch (error) {
    console.error('Error seeding tools:', error);
    throw error;
  }
}

export { seedTools };
