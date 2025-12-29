import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFDocument = require('pdfkit');;
const fs = require('fs');;
import { PassThrough } from 'stream';
import { fileURLToPath } from 'url';
const path = require('path');;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

const PDFGenerator = (buildPDF, filename = null) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];
    const pass = new PassThrough();
    doc.pipe(pass);
    // Pipe PDF output to ../public folder using __dirname to build an absolute path with a unique timestamp.
    const timestamp = Date.now();
    // Use provided filename or default to attendance-record
    const pdfFilename = filename || `attendance-record-${timestamp}.pdf`;
    const pdfPath = path.join(
      __dirname,
      '../public',
      pdfFilename,
    );
    ensureDirectoryExistence(pdfPath);
    doc.pipe(fs.createWriteStream(pdfPath));

    pass.on('data', (chunk) => buffers.push(chunk));
    pass.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    try {
      buildPDF(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default PDFGenerator;
