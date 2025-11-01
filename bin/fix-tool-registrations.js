#!/usr/bin/env node

/**
 * Quick script to fix tool registration patterns
 * Converts from: server.tool({ name, description, inputSchema, handler })
 * To: server.tool(name, { description, paramsSchema }, handler)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toolsDir = path.join(__dirname, '..', 'src', 'tools', 'websets');

function fixToolRegistration(content) {
  // Pattern to match server.tool({ name: "...", description: "...", inputSchema: schema, handler: async (args) => { ... } })
  const toolRegex = /server\.tool\(\s*\{([^}]+name:\s*"([^"]+)"[^}]*)\}\s*\);/gs;
  
  return content.replace(toolRegex, (match, configContent, toolName) => {
    // Extract parts
    const descMatch = configContent.match(/description:\s*"([^"]*)"/);
    const inputSchemaMatch = configContent.match(/inputSchema:\s*(\w+)/);
    const handlerMatch = match.match(/handler:\s*(async\s*)?\(([^)]*)\)\s*=>\s*\{/);
    
    if (!descMatch || !inputSchemaMatch) {
      console.log(`Warning: Could not parse tool ${toolName}, skipping`);
      return match;
    }
    
    const description = descMatch[1];
    const inputSchema = inputSchemaMatch[1];
    const isAsync = handlerMatch && handlerMatch[1] ? 'async ' : '';
    const args = handlerMatch && handlerMatch[2] ? handlerMatch[2] : 'args';
    
    // Find the handler body (everything after handler: until the closing of server.tool)
    const handlerStart = match.indexOf('handler:');
    const handlerBody = match.substring(handlerStart + 8).trim(); // Skip 'handler:'
    
    return `server.tool(\n    "${toolName}",\n    {\n      description: "${description}",\n      paramsSchema: ${inputSchema}.shape\n    },\n    ${handlerBody}`;
  });
}

// Process all TypeScript files in websets directory
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

for (const file of files) {
  const filePath = path.join(toolsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const fixed = fixToolRegistration(content);
  
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, 'utf-8');
    console.log(`Fixed: ${file}`);
  }
}

console.log('Done!');
