import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Import the category mappings from the migrate-categories.ts file
import { categoryMapping, subcategoryMapping } from './migrate-categories'

interface PromptCategoryRelation {
  promptId: string
  oldCategoryName: string
  oldSubcategoryName: string
}

interface PromptBackup {
  id: string
  titleEn: string
  titleAr: string
  categories: {
    category: {
      id: string
      nameEn: string
      nameAr: string
    }
    subcategory: {
      id: string
      nameEn: string
      nameAr: string
    }
  }[]
}

// Type for the category mapping
type CategoryMappingType = typeof categoryMapping;
type SubcategoryMappingType = typeof subcategoryMapping;

// Define interfaces for our category data structure
interface CategoryWithChildren {
  id: string
  nameEn: string
  nameAr: string
  iconName: string
  parentId: string | null
  children: CategoryWithChildren[]
}

async function reassignCategories() {
  try {
    console.log('Starting category reassignment process...')
    
    // Load backup data
    const backupDir = path.join(process.cwd(), 'prisma', 'backup')
    const promptsBackupPath = path.join(backupDir, 'prompts-backup.json')
    const relationsBackupPath = path.join(backupDir, 'prompt-category-relations.json')
    
    if (!fs.existsSync(promptsBackupPath) || !fs.existsSync(relationsBackupPath)) {
      throw new Error('Backup files not found. Please run the migration script first.')
    }
    
    const promptsBackup = JSON.parse(fs.readFileSync(promptsBackupPath, 'utf-8')) as PromptBackup[]
    const relationsBackup = JSON.parse(fs.readFileSync(relationsBackupPath, 'utf-8')) as PromptCategoryRelation[]
    
    console.log(`Loaded ${promptsBackup.length} prompts and ${relationsBackup.length} category relations from backup`)
    
    // Get all categories
    const mainCategories = await prisma.category.findMany({
      where: {
        parentId: null
      },
      include: {
        children: true
      }
    })
    
    console.log(`Loaded ${mainCategories.length} main categories with their subcategories`)
    
    // Create maps for quick lookup
    const categoryMap = new Map<string, CategoryWithChildren>()
    const subcategoryMap = new Map<string, CategoryWithChildren>()
    
    mainCategories.forEach(category => {
      // Cast to our interface
      const categoryWithChildren = category as unknown as CategoryWithChildren
      categoryMap.set(category.nameEn, categoryWithChildren)
      
      if (categoryWithChildren.children) {
        categoryWithChildren.children.forEach(subcategory => {
          // Use a composite key of categoryName:subcategoryName for unique lookup
          subcategoryMap.set(`${category.nameEn}:${subcategory.nameEn}`, subcategory)
          // Also store by subcategory name for direct lookup
          subcategoryMap.set(subcategory.nameEn, subcategory)
        })
      }
    })
    
    // Track statistics
    const stats = {
      total: relationsBackup.length,
      reassigned: 0,
      failed: 0,
      skipped: 0
    }
    
    // Track failures for logging
    const failures = []
    
    // Process each prompt-category relation
    for (const relation of relationsBackup) {
      try {
        const { promptId, oldCategoryName, oldSubcategoryName } = relation
        
        // Check if the prompt still exists
        const prompt = await prisma.prompt.findUnique({
          where: { id: promptId }
        })
        
        if (!prompt) {
          console.log(`Skipping prompt ${promptId} - not found in database`)
          stats.skipped++
          continue
        }
        
        // Find the new category and subcategory using the mapping
        let newCategoryName = oldCategoryName
        // Check if we have a mapping for this category
        if (oldCategoryName in categoryMapping) {
          newCategoryName = categoryMapping[oldCategoryName as keyof CategoryMappingType]
        }
        
        // Check if we have a mapping for this subcategory
        const newSubcategoryMapping = oldSubcategoryName in subcategoryMapping 
          ? subcategoryMapping[oldSubcategoryName as keyof SubcategoryMappingType]
          : null
        
        // If we have a specific subcategory mapping, use that
        if (newSubcategoryMapping) {
          newCategoryName = newSubcategoryMapping[0]
          const newSubcategoryName = newSubcategoryMapping[1]
          
          // Get the category and subcategory objects
          const category = categoryMap.get(newCategoryName)
          const subcategory = subcategoryMap.get(`${newCategoryName}:${newSubcategoryName}`)
          
          if (category && subcategory) {
            // Create the new prompt-category relation
            await prisma.promptCategory.create({
              data: {
                promptId,
                categoryId: category.id,
                subcategoryId: subcategory.id
              }
            })
            
            stats.reassigned++
            console.log(`Reassigned prompt ${promptId} to ${newCategoryName} > ${newSubcategoryName}`)
          } else {
            failures.push({
              promptId,
              oldCategory: oldCategoryName,
              oldSubcategory: oldSubcategoryName,
              newCategory: newCategoryName,
              newSubcategory: newSubcategoryMapping[1],
              reason: 'Category or subcategory not found in new structure'
            })
            stats.failed++
          }
        } else {
          // If we don't have a specific subcategory mapping, just use the category mapping
          // and assign to the first subcategory in that category
          const category = categoryMap.get(newCategoryName)
          
          if (category && category.children && category.children.length > 0) {
            const subcategory = category.children[0]
            
            // Create the new prompt-category relation
            await prisma.promptCategory.create({
              data: {
                promptId,
                categoryId: category.id,
                subcategoryId: subcategory.id
              }
            })
            
            stats.reassigned++
            console.log(`Reassigned prompt ${promptId} to ${newCategoryName} > ${subcategory.nameEn} (best guess)`)
          } else {
            failures.push({
              promptId,
              oldCategory: oldCategoryName,
              oldSubcategory: oldSubcategoryName,
              newCategory: newCategoryName,
              newSubcategory: null,
              reason: 'Category not found or has no subcategories'
            })
            stats.failed++
          }
        }
      } catch (error) {
        console.error(`Error processing relation for prompt ${relation.promptId}:`, error)
        failures.push({
          promptId: relation.promptId,
          oldCategory: relation.oldCategoryName,
          oldSubcategory: relation.oldSubcategoryName,
          reason: 'Error during processing: ' + (error as Error).message
        })
        stats.failed++
      }
    }
    
    // Save failures to a file for manual inspection
    fs.writeFileSync(
      path.join(backupDir, 'reassignment-failures.json'),
      JSON.stringify(failures, null, 2)
    )
    
    console.log('\nReassignment complete!')
    console.log(`Total relations: ${stats.total}`)
    console.log(`Successfully reassigned: ${stats.reassigned}`)
    console.log(`Failed: ${stats.failed}`)
    console.log(`Skipped: ${stats.skipped}`)
    
    if (stats.failed > 0) {
      console.log(`\nSome reassignments failed. Check ${path.join(backupDir, 'reassignment-failures.json')} for details.`)
      console.log('You may need to manually assign categories for these prompts.')
    }
    
    return {
      success: true,
      stats,
      message: 'Category reassignment completed.'
    }
  } catch (error) {
    console.error('Error during category reassignment:', error)
    return {
      success: false,
      message: 'Reassignment failed. See error details above.'
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Only run this function directly if this script is executed directly
if (require.main === module) {
  reassignCategories()
    .then((result) => {
      console.log(result.message)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('Unhandled error during reassignment:', error)
      process.exit(1)
    })
}

export { reassignCategories }
