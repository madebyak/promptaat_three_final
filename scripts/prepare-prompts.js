const fs = require('fs');
const path = require('path');
const { fetchIds } = require('./fetch-ids');

async function preparePrompts() {
  try {
    console.log('Preparing prompts data for upload...');
    
    // Fetch IDs for categories, subcategories, and tools
    const { categories, subcategories, tools } = await fetchIds();
    
    // Read the prompts data file
    const promptsFilePath = path.join(__dirname, '..', 'data-entry', 'prompts-data-entry.md');
    console.log(`Reading prompts data from: ${promptsFilePath}`);
    
    const fileContent = fs.readFileSync(promptsFilePath, 'utf8');
    
    // Parse the markdown file to extract prompt data
    const promptsData = parsePromptsMarkdown(fileContent);
    console.log(`Found ${promptsData.length} prompts to process`);
    
    // Process each prompt to add IDs
    const processedPrompts = promptsData.map((prompt, index) => {
      console.log(`Processing prompt ${index + 1}: ${prompt.titleEn}`);
      
      // Find category and subcategory IDs
      const categoryId = categories[prompt.category_name];
      if (!categoryId) {
        console.warn(`Warning: Category '${prompt.category_name}' not found in database`);
      }
      
      // Try to find subcategory using composite key first
      let subcategoryId = null;
      const compositeKey = `${prompt.category_name}:${prompt.subcategory_name}`;
      if (subcategories[compositeKey]) {
        subcategoryId = subcategories[compositeKey].id;
      } else if (subcategories[prompt.subcategory_name]) {
        // Fall back to direct lookup
        subcategoryId = subcategories[prompt.subcategory_name].id;
      }
      
      if (!subcategoryId) {
        console.warn(`Warning: Subcategory '${prompt.subcategory_name}' not found in database`);
      }
      
      // Find tool IDs
      const toolIds = [];
      let toolNames = [];
      const processedTools = [];
      if (prompt.Tools_name) {
        toolNames = prompt.Tools_name.split(',').map(t => t.trim());
        for (const toolName of toolNames) {
          // Try to find the tool ID using case-insensitive matching
          const result = findToolIdCaseInsensitive(tools, toolName);
          if (result) {
            toolIds.push(result.id);
            processedTools.push({
              id: result.id,
              name: result.name // Use the correct name from the database
            });
          } else {
            console.warn(`Warning: Tool '${toolName}' not found in database`);
            // Still add the tool to the list, but without an ID
            processedTools.push({
              id: null,
              name: toolName
            });
          }
        }
      }
      
      // Extract keywords
      const keywords = prompt.keywords ? prompt.keywords.split(',').map(k => k.trim()) : [];
      
      // Create the processed prompt object
      return {
        titleEn: prompt.titleEn,
        titleAr: prompt.titleAr,
        descriptionEn: prompt.descriptionEn,
        descriptionAr: prompt.descriptionAr,
        promptTextEn: prompt.promptTextEn,
        promptTextAr: prompt.promptTextAr,
        instructionEn: prompt.instructionEn,
        instructionAr: prompt.instructionAr,
        isPro: prompt.is_pro === 'true',
        initialCopyCount: parseInt(prompt.copy_count) || 0,
        category: {
          id: categoryId,
          name: prompt.category_name
        },
        subcategory: {
          id: subcategoryId,
          name: prompt.subcategory_name
        },
        tools: processedTools,
        keywords
      };
    });
    
    // Save the processed data to a JSON file
    const outputFilePath = path.join(__dirname, '..', 'data-entry', 'processed-prompts.json');
    fs.writeFileSync(outputFilePath, JSON.stringify({ prompts: processedPrompts }, null, 2));
    
    console.log(`Processed prompts saved to: ${outputFilePath}`);
    return processedPrompts;
    
  } catch (error) {
    console.error('Error preparing prompts:', error);
    throw error;
  }
}

// Function to parse the markdown file and extract prompt data
function parsePromptsMarkdown(content) {
  const promptSections = content.split('---').filter(section => section.trim() !== '');
  
  return promptSections.map(section => {
    const lines = section.trim().split('\n');
    const promptData = {};
    
    let currentField = null;
    let currentValue = '';
    
    for (const line of lines) {
      // Skip empty lines and the prompt title line
      if (line.trim() === '' || line.startsWith('## Prompt')) {
        continue;
      }
      
      // Check if this is a field definition line
      const fieldMatch = line.match(/^\*\*(.*?)\*\*:\s*(.*)/);
      if (fieldMatch) {
        // If we were processing a previous field, save it
        if (currentField) {
          promptData[currentField] = currentValue.trim();
        }
        
        // Start a new field
        currentField = convertFieldName(fieldMatch[1]);
        currentValue = fieldMatch[2];
      } else {
        // Continue with the current field value
        if (currentField) {
          currentValue += ' ' + line;
        }
      }
    }
    
    // Save the last field
    if (currentField) {
      promptData[currentField] = currentValue.trim();
    }
    
    return promptData;
  });
}

// Function to convert markdown field names to database field names
function convertFieldName(fieldName) {
  const fieldMap = {
    'Title_en': 'titleEn',
    'Title_ar': 'titleAr',
    'Description_en': 'descriptionEn',
    'Description_ar': 'descriptionAr',
    'Prompt_text_en': 'promptTextEn',
    'Prompt_text_ar': 'promptTextAr',
    'Instruction_en': 'instructionEn',
    'Instruction_ar': 'instructionAr',
    'is_pro': 'is_pro',
    'copy_count': 'copy_count',
    'keywords': 'keywords',
    'category_name': 'category_name',
    'subcategory_name': 'subcategory_name',
    'Tools_name': 'Tools_name'
  };
  
  return fieldMap[fieldName] || fieldName;
}

// Function to find a tool ID using case-insensitive matching
function findToolIdCaseInsensitive(toolsMap, toolName) {
  // First try exact match
  if (toolsMap[toolName]) {
    return { id: toolsMap[toolName], name: toolName };
  }
  
  // Try case-insensitive match
  const toolNameLower = toolName.toLowerCase();
  for (const [key, value] of Object.entries(toolsMap)) {
    if (key.toLowerCase() === toolNameLower) {
      console.log(`Found case-insensitive match for '${toolName}': '${key}'`);
      return { id: value, name: key };
    }
  }
  
  return null;
}

// If this script is run directly, execute the preparePrompts function
if (require.main === module) {
  preparePrompts()
    .catch((error) => {
      console.error('Failed to prepare prompts:', error);
      process.exit(1);
    });
} else {
  // Export the function for use in other scripts
  module.exports = { preparePrompts };
}
