import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { seedNewCategories } from './seed-new-categories'

const prisma = new PrismaClient()

interface PromptCategoryRelation {
  promptId: string
  oldCategoryName: string
  oldSubcategoryName: string
}

// Category mapping to help migrate prompts from old to new categories
const categoryMapping = {
  // Old category name -> New category name
  "Content Creation": "Writing",
  "Business & Marketing": "Business",
  "Programming & Development": "Development",
  "Visual Arts": "Design",
  "Education & Learning": "Education",
  "Data & Analytics": "Business", // Map to Business or Finance depending on subcategory
  "Personal Development": "Career",
  "Research & Analysis": "Education", // Could also map to Business depending on subcategory
  "Legal & Compliance": "Legal",
  "Entertainment & Media": "Entertainment"
}

// Subcategory mapping to help migrate prompts from old to new subcategories
const subcategoryMapping = {
  // Old subcategory name -> [New category name, New subcategory name]
  "Blog Writing": ["Writing", "Blog & Articles"],
  "Social Media Posts": ["Social Media", "Captions"],
  "Email Writing": ["Communication", "Work Emails"],
  "Product Descriptions": ["Marketing", "Content Creation"],
  "Academic Writing": ["Education", "Learning Content"],
  "Technical Writing": ["Development", "Documentation"],
  "Creative Writing": ["Writing", "Creative Writing"],
  "Script Writing": ["Writing", "Scripts"],
  
  "Marketing Strategy": ["Marketing", "Content Creation"],
  "Sales Copy": ["Marketing", "Content Creation"],
  "Brand Development": ["Design", "Branding"],
  "Market Research": ["Business", "Market Analysis"],
  "Business Plans": ["Business", "Business Plans"],
  "Customer Service": ["Customer Support", "Response Templates"],
  "Advertising": ["Marketing", "Ad Campaigns"],
  
  "Code Generation": ["Development", "Code & Debug"],
  "Code Review": ["Development", "Code & Debug"],
  "Bug Fixing": ["Development", "Troubleshooting"],
  "Documentation": ["Development", "Documentation"],
  "Architecture Design": ["Development", "API Integration"],
  "Testing": ["Development", "Troubleshooting"],
  "DevOps": ["Development", "Troubleshooting"],
  
  "Image Generation": ["Design", "Digital Art"],
  "Art Direction": ["Design", "Digital Art"],
  "Character Design": ["Entertainment", "Characters"],
  "Environment Design": ["Design", "Digital Art"],
  "Logo Design": ["Design", "Logo Design"],
  "UI/UX Design": ["Design", "UI/UX"],
  "Animation": ["Design", "Motion Graphics"],
  
  "Lesson Planning": ["Education", "Lesson Plans"],
  "Study Guides": ["Education", "Learning Content"],
  "Quiz Generation": ["Education", "Quizzes & Exams"],
  "Research Assistance": ["Education", "Learning Content"],
  "Language Learning": ["Education", "Skill Building"],
  "Tutoring": ["Education", "Explanations"],
  
  "Data Analysis": ["Business", "Market Analysis"],
  "Data Visualization": ["Business", "Market Analysis"],
  "Statistical Analysis": ["Business", "Market Analysis"],
  "Machine Learning": ["Development", "Algorithms"],
  "Business Intelligence": ["Business", "Strategy"],
  "Reporting": ["Business", "Financial Reports"],
  
  "Goal Setting": ["Productivity", "Goal Setting"],
  "Career Development": ["Career", "Career Advice"],
  "Life Coaching": ["Career", "Personal Brand"],
  "Productivity": ["Productivity", "Time Management"],
  "Mental Health": ["Career", "Personal Brand"],
  "Time Management": ["Productivity", "Time Management"],
  
  "Academic Research": ["Education", "Learning Content"],
  "Market Analysis": ["Business", "Market Analysis"],
  "Competitive Analysis": ["Business", "Market Analysis"],
  "Literature Review": ["Education", "Learning Content"],
  "Trend Analysis": ["Business", "Market Analysis"],
  "Scientific Writing": ["Education", "Learning Content"],
  
  "Legal Writing": ["Legal", "Legal Documents"],
  "Contract Review": ["Legal", "Contracts"],
  "Policy Generation": ["Legal", "Compliance"],
  "Compliance Checks": ["Legal", "Compliance"],
  "Terms & Conditions": ["Legal", "Legal Documents"],
  "Privacy Policies": ["Legal", "Legal Documents"],
  
  "Storytelling": ["Entertainment", "Stories & Scripts"],
  "Game Design": ["Entertainment", "Game Design"],
  "Video Scripts": ["Entertainment", "Stories & Scripts"],
  "Podcast Scripts": ["Entertainment", "Stories & Scripts"],
  "Music Generation": ["Entertainment", "Media Concepts"],
  "Entertainment Writing": ["Entertainment", "Stories & Scripts"]
}

async function backupExistingData() {
  console.log('Backing up existing data...')
  
  // Get all prompts with their category relationships
  const prompts = await prisma.prompt.findMany({
    include: {
      categories: {
        include: {
          category: true,
          subcategory: true
        }
      }
    }
  })
  
  // Create backup directory if it doesn't exist
  const backupDir = path.join(process.cwd(), 'prisma', 'backup')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  // Save prompts data
  fs.writeFileSync(
    path.join(backupDir, 'prompts-backup.json'),
    JSON.stringify(prompts, null, 2)
  )
  
  // Extract prompt-category relationships for later remapping
  const promptCategoryRelations: PromptCategoryRelation[] = []
  
  for (const prompt of prompts) {
    for (const relation of prompt.categories) {
      promptCategoryRelations.push({
        promptId: prompt.id,
        oldCategoryName: relation.category.nameEn,
        oldSubcategoryName: relation.subcategory.nameEn
      })
    }
  }
  
  // Save category relationships
  fs.writeFileSync(
    path.join(backupDir, 'prompt-category-relations.json'),
    JSON.stringify(promptCategoryRelations, null, 2)
  )
  
  console.log(`Backup completed. Files saved to ${backupDir}`)
  return promptCategoryRelations
}

async function deleteExistingCategories() {
  console.log('Deleting existing prompt-category relationships...')
  
  // Delete all prompt-category relationships
  await prisma.promptCategory.deleteMany({})
  
  console.log('Deleting existing categories...')
  
  // Delete all categories
  await prisma.category.deleteMany({})
  
  console.log('Existing categories deleted successfully')
}

async function createCategoryMappingGuide() {
  console.log('Creating category mapping guide...')
  
  // Create a mapping guide to help with reassigning prompts to new categories
  const mappingGuide = {
    categoryMapping,
    subcategoryMapping,
    instructions: `
    # Category Migration Guide
    
    This guide will help you reassign prompts to the new category structure.
    
    ## Steps to Reassign Categories:
    
    1. For each prompt in the backup file, find its old category and subcategory
    2. Use the mapping tables below to find the corresponding new category and subcategory
    3. Update the prompt's category associations in the database
    
    ## Category Mapping
    
    Old Category Name -> New Category Name
    
    ${Object.entries(categoryMapping).map(([oldName, newName]) => `- "${oldName}" -> "${newName}"`).join('\n')}
    
    ## Subcategory Mapping
    
    Old Subcategory Name -> [New Category Name, New Subcategory Name]
    
    ${Object.entries(subcategoryMapping).map(([oldName, [newCat, newSub]]) => `- "${oldName}" -> ["${newCat}", "${newSub}"]`).join('\n')}
    
    ## For Prompts Without Mappings
    
    If a prompt's old category or subcategory doesn't have a mapping, use your best judgment to assign it to the most appropriate new category and subcategory.
    `
  }
  
  // Save mapping guide
  fs.writeFileSync(
    path.join(process.cwd(), 'prisma', 'backup', 'category-mapping-guide.json'),
    JSON.stringify(mappingGuide, null, 2)
  )
  
  // Save mapping guide as markdown for easier reading
  fs.writeFileSync(
    path.join(process.cwd(), 'prisma', 'backup', 'category-mapping-guide.md'),
    mappingGuide.instructions
  )
  
  console.log('Category mapping guide created')
}

async function migrateCategories() {
  try {
    // Step 1: Backup existing data
    const promptCategoryRelations = await backupExistingData()
    
    // Step 2: Create category mapping guide
    await createCategoryMappingGuide()
    
    // Step 3: Delete existing categories and their relationships
    await deleteExistingCategories()
    
    // Step 4: Seed new categories
    await seedNewCategories()
    
    console.log('Migration completed successfully!')
    console.log('IMPORTANT: Existing prompts have lost their category associations.')
    console.log('You will need to reassign categories to prompts using the mapping in:')
    console.log('prisma/backup/category-mapping-guide.md')
    
    return {
      success: true,
      message: 'Categories migrated successfully. Prompts need category reassignment.'
    }
  } catch (error) {
    console.error('Error during migration:', error)
    return {
      success: false,
      message: 'Migration failed. See error details above.'
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Only run this function directly if this script is executed directly
if (require.main === module) {
  migrateCategories()
    .then((result) => {
      console.log(result.message)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('Unhandled error during migration:', error)
      process.exit(1)
    })
}

export { migrateCategories, categoryMapping, subcategoryMapping }
