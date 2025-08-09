import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const rootDistDir = join(rootDir, 'dist');

// Ensure root dist directory exists
if (!existsSync(rootDistDir)) {
  mkdirSync(rootDistDir, { recursive: true });
}

console.log('Preparing CDN files...');

// Copy vanilj meta-package files to root dist for CDN
const vaniljDistDir = join(rootDir, 'packages', 'vanilj', 'dist');

const filesToCopy = [
  { src: 'vanilj.umd.js', dest: 'vanilj.umd.js' },
  { src: 'vanilj.es.js', dest: 'vanilj.es.js' },
];

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = join(vaniljDistDir, src);
  const destPath = join(rootDistDir, dest);
  
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, destPath);
    console.log(`✓ Copied ${src} → ${dest}`);
  } else {
    console.warn(`⚠ Source file not found: ${src}`);
  }
});

// Also copy the core files that were already there
const coreDistDir = join(rootDir, 'packages', 'vanilj-core', 'dist');
const coreFiles = [
  { src: 'vanilj-core.min.umd.js', dest: 'vanilj-core.min.umd.js' },
  { src: 'vanilj-core.umd.js', dest: 'vanilj-core.umd.js' },
];

coreFiles.forEach(({ src, dest }) => {
  const srcPath = join(coreDistDir, src);
  const destPath = join(rootDistDir, dest);
  
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, destPath);
    console.log(`✓ Copied ${src} → ${dest}`);
  } else {
    console.warn(`⚠ Source file not found: ${src}`);
  }
});

console.log('CDN files prepared successfully!');
console.log('\nFiles available for CDN:');
console.log('- vanilj.umd.js (Complete framework bundle)');
console.log('- vanilj.es.js (ES module version)');
console.log('- vanilj-core.min.umd.js (Core only, minified)');
console.log('- vanilj-core.umd.js (Core only, unminified)');