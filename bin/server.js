#!/usr/bin/env node

/**
 * Simple wrapper to run the Exa Websets MCP server with tsx
 * This bypasses the Smithery CLI build issues
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the TypeScript entry point
const serverPath = join(__dirname, '..', 'src', 'index.ts');

// Spawn tsx to run the TypeScript file
const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Pass through EXA_API_KEY and other env vars
  }
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
