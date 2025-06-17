const fs = require('fs');
const path = require('path');

// Input and output paths
const SCHEMAS_DIR = path.join(__dirname, 'schemas');
const OUTPUT_FILE = path.join(__dirname, '../prompt_assets/tools.json');

// Read all schema files
function loadToolSchemas() {
  const files = fs.readdirSync(SCHEMAS_DIR);
  const tools = {};
  
  files.forEach(file => {
    if (file.endsWith('.json')) {
      try {
        const filePath = path.join(SCHEMAS_DIR, file);
        const toolData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Convert schema to a compact JSON string without extra escaping
        const schemaString = JSON.stringify(toolData.schema)
          .replace(/\\n/g, '\\\\n')           // Preserve literal newlines
          .replace(/\s+/g, ' ')                // Collapse multiple spaces to one
          .trim();
        
        tools[toolData.name] = {
          description: toolData.description,
          schema: `<${toolData.name}>${schemaString}</${toolData.name}>`
        };
        
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  });
  
  return tools;
}

// Generate the final tools.json
function buildToolsJson() {
  try {
    const tools = loadToolSchemas();
    const output = JSON.stringify(tools, null, 2);
    
    // Write to the final location
    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`Successfully generated ${OUTPUT_FILE}`);
    console.log(`Processed ${Object.keys(tools).length} tools`);
  } catch (error) {
    console.error('Error building tools.json:', error);
    process.exit(1);
  }
}

// Run the build
buildToolsJson();
