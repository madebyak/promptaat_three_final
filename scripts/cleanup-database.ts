import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDatabase() {
  try {
    console.log('Starting database cleanup...')

    // 1. First, clean up junction tables
    console.log('Cleaning up junction tables...')
    
    // Clean prompt_keywords
    await prisma.promptKeyword.deleteMany({})
    console.log('✓ Cleaned prompt_keywords')
    
    // Clean prompt_tools
    await prisma.promptTool.deleteMany({})
    console.log('✓ Cleaned prompt_tools')
    
    // Clean prompt_categories
    await prisma.promptCategory.deleteMany({})
    console.log('✓ Cleaned prompt_categories')

    // 2. Clean up prompts (hard delete)
    console.log('Cleaning up prompts...')
    await prisma.prompt.deleteMany({})
    console.log('✓ Cleaned prompts')

    // 3. Clean up tools (hard delete)
    console.log('Cleaning up tools...')
    await prisma.tool.deleteMany({})
    console.log('✓ Cleaned tools')

    // 4. Clean up categories (hard delete)
    console.log('Cleaning up categories...')
    await prisma.category.deleteMany({})
    console.log('✓ Cleaned categories')

    console.log('Database cleanup completed successfully!')
  } catch (error) {
    console.error('Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupDatabase()
  .catch((error) => {
    console.error('Failed to clean up database:', error)
    process.exit(1)
  })
