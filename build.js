#!/usr/bin/env node

// Ultra simplified build script using ES modules
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Set environment variables to avoid native rollup issues
process.env.ROLLUP_SKIP_NATIVE = 'true';
process.env.ROLLUP_NO_NATIVE = '1';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try different methods to run vite build
try {
  console.log('Trying to run vite build using npx...');
  execSync('npx vite build', { stdio: 'inherit' });
  // Exit if successful
  process.exit(0);
} catch (err) {
  console.log('npx approach failed, trying direct node_modules path...');
  
  try {
    const vitePath = path.resolve(__dirname, 'node_modules/vite/bin/vite.js');
    if (fs.existsSync(vitePath)) {
      console.log(`Found vite at ${vitePath}, running directly...`);
      execSync(`node "${vitePath}" build`, { stdio: 'inherit' });
      // Exit if successful
      process.exit(0);
    } else {
      console.error('Could not find vite.js in node_modules.');
      process.exit(1);
    }
  } catch (err) {
    console.error('All attempts to run vite build failed:', err.message);
    process.exit(1);
  }
}

buildProcess.on('close', (code) => {
  process.exit(code);
});
