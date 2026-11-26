import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const src = path.join(projectRoot, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const destDir = path.join(projectRoot, 'public');
const dest = path.join(destDir, 'pdf.worker.min.mjs');

if (fs.existsSync(src)) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('[rolefit] Copied pdf.worker.min.mjs to public/pdf.worker.min.mjs');
} else {
  console.warn('[rolefit] Warning: pdf.worker.min.mjs not found at', src);
}
