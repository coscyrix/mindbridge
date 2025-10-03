import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');;
const path = require('path');;
import { fileURLToPath } from 'url';
import logger from '../config/winston.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    logger.info('Created uploads directory:', uploadsDir);
  }
} catch (error) {
  logger.warn('Could not create uploads directory during module load:', error.message);
  // Continue execution - the directory will be created when needed
}

export const saveFile = async (file, subdirectory = '') => {
  try {
    // Ensure uploads directory exists first
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create subdirectory if it doesn't exist
    const targetDir = path.join(uploadsDir, subdirectory);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    const filepath = path.join(targetDir, filename);

    // Save file
    await fs.promises.writeFile(filepath, file.buffer);

    // Return relative path for storage in database
    return `/uploads/${subdirectory}/${filename}`;
  } catch (error) {
    logger.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
};

export const deleteFile = async (filepath) => {
  try {
    const absolutePath = path.join(process.cwd(), filepath);
    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
    }
  } catch (error) {
    logger.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}; 