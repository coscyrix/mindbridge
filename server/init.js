import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');

console.log('Initializing server...');
console.log('Current directory:', __dirname);
console.log('Uploads directory path:', uploadsDir);

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory:', uploadsDir);
  } else {
    console.log('✅ Uploads directory already exists:', uploadsDir);
  }
  
  // Check permissions
  const stats = fs.statSync(uploadsDir);
  console.log('📁 Uploads directory permissions:', stats.mode.toString(8));
  console.log('👤 Owner:', stats.uid);
  console.log('👥 Group:', stats.gid);
  
} catch (error) {
  console.error('❌ Error creating uploads directory:', error);
  console.error('Error details:', {
    code: error.code,
    errno: error.errno,
    path: error.path,
    syscall: error.syscall
  });
  process.exit(1);
}

console.log('✅ Server initialization complete'); 