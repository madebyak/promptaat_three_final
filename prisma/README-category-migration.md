# Category Migration Process

This document outlines the process for migrating from the old category structure to the new, more concise category structure with improved icon names for both categories and subcategories.

## Migration Files

The migration process involves the following files:

1. `seed-new-categories.ts` - Contains the new category structure with concise names and icon names
2. `migrate-categories.ts` - Handles the migration process (backup, delete old categories, seed new categories)
3. `reassign-categories.ts` - Helps reassign existing prompts to the new category structure

## Migration Steps

### Step 1: Backup Your Database

Before running any migration scripts, make sure to back up your database:

```bash
# For PostgreSQL
pg_dump -U your_username -d your_database_name > backup_before_migration.sql

# For SQLite
cp prisma/dev.db prisma/dev.db.backup
```

### Step 2: Run the Migration Script

The migration script will:

- Back up existing prompts and their category relationships
- Delete existing categories and their relationships
- Seed the database with the new categories
- Create a mapping guide to help reassign categories

```bash
npx ts-node prisma/migrate-categories.ts
```

### Step 3: Reassign Categories to Prompts

After the migration, existing prompts will lose their category associations. You can use the reassignment script to automatically reassign categories based on the mapping:

```bash
npx ts-node prisma/reassign-categories.ts
```

The reassignment script will:

- Use the backup data and mapping guide to reassign categories to existing prompts
- Log any failures or issues during the reassignment process
- Create a report of prompts that couldn't be automatically reassigned

### Step 4: Manual Review and Cleanup

After running the reassignment script, you should:

1. Check the `prisma/backup/reassignment-failures.json` file for any prompts that couldn't be automatically reassigned
2. Manually assign categories to these prompts using the admin interface
3. Test the application to ensure all prompts are correctly categorized

## Category Mapping

The migration includes a mapping from old categories and subcategories to the new structure. This mapping is used by the reassignment script to automatically reassign prompts.

### Old to New Category Mapping

- "Content Creation" → "Writing"
- "Business & Marketing" → "Business"
- "Programming & Development" → "Development"
- "Visual Arts" → "Design"
- "Education & Learning" → "Education"
- "Data & Analytics" → "Business"
- "Personal Development" → "Career"
- "Research & Analysis" → "Education"
- "Legal & Compliance" → "Legal"
- "Entertainment & Media" → "Entertainment"

### Subcategory Mapping

Subcategories are mapped to their most appropriate new category and subcategory. For example:

- "Blog Writing" → ["Writing", "Blog & Articles"]
- "Social Media Posts" → ["Social Media", "Captions"]
- "Email Writing" → ["Communication", "Work Emails"]

The full mapping can be found in the `prisma/backup/category-mapping-guide.md` file after running the migration script.

## Troubleshooting

If you encounter any issues during the migration process:

1. Restore your database from the backup
2. Check the error messages in the console
3. Fix any issues in the migration scripts
4. Try running the migration again

## Post-Migration Verification

After completing the migration, verify that:

1. All categories and subcategories are correctly displayed in the UI
2. The sidebar shows the concise category names correctly
3. Icons are displayed properly for both categories and subcategories
4. Existing prompts are correctly categorized
5. The application works correctly in both English and Arabic

## Rollback Procedure

If you need to roll back the migration:

1. Restore your database from the backup
2. Run the application to verify that everything is back to the previous state
