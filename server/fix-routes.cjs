#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing route imports...');

const routesDir = './routes';
const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

console.log(`Found ${routeFiles.length} route files to check`);

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  console.log(`\n=== Checking ${file} ===`);

  // Check if file already has createRequire
  if (content.includes('createRequire')) {
    console.log(`✅ ${file} already has createRequire`);
    return;
  }

  // Check for problematic imports
  const problematicImports = [
    /import\s+.*\s+from\s+['"]express['"]/g,
    /import\s+.*\s+from\s+['"]cors['"]/g,
    /import\s+.*\s+from\s+['"]multer['"]/g,
    /import\s+.*\s+from\s+['"]path['"]/g,
    /import\s+.*\s+from\s+['"]fs['"]/g,
    /import\s+.*\s+from\s+['"]dotenv['"]/g,
    /import\s+.*\s+from\s+['"]winston['"]/g,
    /import\s+.*\s+from\s+['"]body-parser['"]/g,
    /import\s+.*\s+from\s+['"]jsonwebtoken['"]/g,
    /import\s+.*\s+from\s+['"]bcrypt['"]/g,
    /import\s+.*\s+from\s+['"]speakeasy['"]/g,
    /import\s+.*\s+from\s+['"]joi['"]/g,
    /import\s+.*\s+from\s+['"]moment-timezone['"]/g,
    /import\s+.*\s+from\s+['"]nodemailer['"]/g,
    /import\s+.*\s+from\s+['"]puppeteer['"]/g,
    /import\s+.*\s+from\s+['"]pdfkit['"]/g,
    /import\s+.*\s+from\s+['"]knex['"]/g,
    /import\s+.*\s+from\s+['"]mysql2['"]/g
  ];

  const hasProblematicImports = problematicImports.some(pattern => pattern.test(content));
  
  if (!hasProblematicImports) {
    console.log(`✅ ${file} has no problematic imports`);
    return;
  }

  // Add createRequire at the top
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Find the first import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      insertIndex = i;
      break;
    }
  }
  
  // Insert createRequire
  lines.splice(insertIndex, 0, "import { createRequire } from 'module';");
  lines.splice(insertIndex + 1, 0, "const require = createRequire(import.meta.url);");
  content = lines.join('\n');

  // Replace common imports
  const replacements = [
    [/import\s+(\w+)\s+from\s+['"]express['"]/g, "const $1 = require('express');"],
    [/import\s+(\w+)\s+from\s+['"]cors['"]/g, "const $1 = require('cors');"],
    [/import\s+(\w+)\s+from\s+['"]multer['"]/g, "const $1 = require('multer');"],
    [/import\s+(\w+)\s+from\s+['"]path['"]/g, "const $1 = require('path');"],
    [/import\s+(\w+)\s+from\s+['"]fs['"]/g, "const $1 = require('fs');"],
    [/import\s+(\w+)\s+from\s+['"]dotenv['"]/g, "const $1 = require('dotenv');"],
    [/import\s+(\w+)\s+from\s+['"]winston['"]/g, "const $1 = require('winston');"],
    [/import\s+(\w+)\s+from\s+['"]body-parser['"]/g, "const $1 = require('body-parser');"],
    [/import\s+(\w+)\s+from\s+['"]jsonwebtoken['"]/g, "const $1 = require('jsonwebtoken');"],
    [/import\s+(\w+)\s+from\s+['"]bcrypt['"]/g, "const $1 = require('bcrypt');"],
    [/import\s+(\w+)\s+from\s+['"]speakeasy['"]/g, "const $1 = require('speakeasy');"],
    [/import\s+(\w+)\s+from\s+['"]joi['"]/g, "const $1 = require('joi');"],
    [/import\s+(\w+)\s+from\s+['"]moment-timezone['"]/g, "const $1 = require('moment-timezone');"],
    [/import\s+(\w+)\s+from\s+['"]nodemailer['"]/g, "const $1 = require('nodemailer');"],
    [/import\s+(\w+)\s+from\s+['"]puppeteer['"]/g, "const $1 = require('puppeteer');"],
    [/import\s+(\w+)\s+from\s+['"]pdfkit['"]/g, "const $1 = require('pdfkit');"],
    [/import\s+(\w+)\s+from\s+['"]knex['"]/g, "const $1 = require('knex');"],
    [/import\s+(\w+)\s+from\s+['"]mysql2['"]/g, "const $1 = require('mysql2');"]
  ];

  replacements.forEach(([pattern, replacement]) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed imports in ${file}`);
  } else {
    console.log(`ℹ️  No changes needed for ${file}`);
  }
});

console.log('\n🎉 Route import fixing complete!');
