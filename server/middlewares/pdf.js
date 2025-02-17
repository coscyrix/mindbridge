import PDFDocument from 'pdfkit';
import fs from 'fs';
import { PassThrough } from 'stream';
import { fileURLToPath } from 'url';
import path from 'path';

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

const PDFGenerator = (buildPDF) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];
    const pass = new PassThrough();
    doc.pipe(pass);
    // Pipe PDF output to ../public folder using __dirname to build an absolute path with a unique timestamp.
    const timestamp = Date.now();
    const pdfPath = path.join(
      __dirname,
      '../public',
      `attendance-record-${timestamp}.pdf`,
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
