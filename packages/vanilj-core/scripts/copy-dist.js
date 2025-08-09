import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..');
const distDir = join(packageRoot, 'dist');

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy files from dev and min directories to root dist
const filesToCopy = [
  // Development builds
  { src: 'dev/vanilj-core.es.js', dest: 'vanilj-core.js' },
  { src: 'dev/vanilj-core.es.js.map', dest: 'vanilj-core.js.map' },
  { src: 'dev/vanilj-core.umd.js', dest: 'vanilj-core.umd.js' },
  { src: 'dev/vanilj-core.umd.js.map', dest: 'vanilj-core.umd.js.map' },
  
  // Production builds (minified)
  { src: 'min/vanilj-core.es.js', dest: 'vanilj-core.min.js' },
  { src: 'min/vanilj-core.es.js.map', dest: 'vanilj-core.min.js.map' },
  { src: 'min/vanilj-core.umd.js', dest: 'vanilj-core.min.umd.js' },
  { src: 'min/vanilj-core.umd.js.map', dest: 'vanilj-core.min.umd.js.map' },
];

// Also create a CommonJS version for require()
filesToCopy.push(
  { src: 'dev/vanilj-core.umd.js', dest: 'vanilj-core.umd.cjs' }
);

console.log('Copying distribution files...');

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = join(distDir, src);
  const destPath = join(distDir, dest);
  
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, destPath);
    console.log(`✓ Copied ${src} → ${dest}`);
  } else {
    console.warn(`⚠ Source file not found: ${src}`);
  }
});

console.log('Distribution files copied successfully!');