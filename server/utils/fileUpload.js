import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../config/winston.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const saveFile = async (file, subdirectory = '') => {
  try {
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
    const absolutePath = path.join(__dirname, '../..', filepath);
    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
    }
  } catch (error) {
    logger.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}; 