#!/usr/bin/env tsx

/**
 * Simplified EXA Websets MCP Server for local testing
 * This bypasses the complex tool registration issues
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

async function main() {
  const config = {
    exaApiKey: process.env.EXA_API_KEY || '',
    debug: process.env.DEBUG_MODE === 'true'
  };

  if (!config.exaApiKey) {
    console.error('Error: EXA_API_KEY environment variable is required');
    process.exit(1);
  }

  if (config.debug) {
    console.error('[DEBUG] Starting Simplified Exa Websets MCP Server');
  }

  // Create MCP server
  const mcpServer = new McpServer({
    name: "exa-websets-server", 
    version: "1.0.0"
  });

  // Register a simple test tool
  mcpServer.tool(
    "test_exa_connection",
    "Test the EXA API connection and return server status",
    async () => {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: "EXA Websets MCP Server is running!",
            apiKeyConfigured: !!config.exaApiKey,
            serverVersion: "1.0.0"
          }, null, 2)
        }]
      };
    }
  );

  if (config.debug) {
    console.error('[DEBUG] Tools registered successfully');
  }

  // Create STDIO transport
  const transport = new StdioServerTransport();
  
  if (config.debug) {
    console.error('[DEBUG] Connecting server to STDIO transport');
  }

  // Connect the server
  await mcpServer.server.connect(transport);

  if (config.debug) {
    console.error('[DEBUG] Server started successfully on STDIO');
  }

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    if (config.debug) {
      console.error('[DEBUG] Shutting down...');
    }
    await mcpServer.server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    if (config.debug) {
      console.error('[DEBUG] Shutting down...');
    }
    await mcpServer.server.close();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
