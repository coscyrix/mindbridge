#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all JS files
function findJSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
      findJSFiles(fullPath, files);
    } else if (item.endsWith('.js') && !item.includes('fix-esm-imports.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to fix require statements in a file
function fixRequireStatements(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Skip files that don't use ES modules (no import statements)
    if (!content.includes('import ') && !content.includes('export default')) {
      return false;
    }
    
    // Pattern to match require statements for ES modules
    const requirePattern = /const\s+(\w+)\s*=\s*require\(['"`]([^'"`]+)\.js['"`]\)\.default;/g;
    const requirePatternNoDefault = /const\s+(\w+)\s*=\s*require\(['"`]([^'"`]+)\.js['"`]\);/g;
    
    // Replace require statements with import statements
    content = content.replace(requirePattern, (match, varName, modulePath) => {
      modified = true;
      return `import ${varName} from '${modulePath}.js';`;
    });
    
    content = content.replace(requirePatternNoDefault, (match, varName, modulePath) => {
      // Only replace if it looks like it should be an import
      if (modulePath.includes('/controllers/') || 
          modulePath.includes('/services/') || 
          modulePath.includes('/models/') ||
          modulePath.includes('/middlewares/') ||
          modulePath.includes('/utils/')) {
        modified = true;
        return `import ${varName} from '${modulePath}.js';`;
      }
      return match;
    });
    
    // Handle destructured require statements
    const destructuredPattern = /const\s*\{\s*([^}]+)\s*\}\s*=\s*require\(['"`]([^'"`]+)\.js['"`]\);/g;
    content = content.replace(destructuredPattern, (match, imports, modulePath) => {
      if (modulePath.includes('/controllers/') || 
          modulePath.includes('/services/') || 
          modulePath.includes('/models/') ||
          modulePath.includes('/middlewares/') ||
          modulePath.includes('/utils/')) {
        modified = true;
        return `import { ${imports} } from '${modulePath}.js';`;
      }
      return match;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔧 Fixing ES Module import statements...\n');

const jsFiles = findJSFiles(__dirname);
let fixedCount = 0;

for (const file of jsFiles) {
  if (fixRequireStatements(file)) {
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('🎉 ES Module import fixes complete!');
