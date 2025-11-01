#!/usr/bin/env tsx

/**
 * STDIO runner for Exa Websets MCP Server
 * This script initializes and runs the MCP server with STDIO transport
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  registerWebsetManagementTools,
  registerWebsetSearchTools,
  registerWebsetEnrichmentTools,
  registerWebsetItemTools,
  registerWebsetOperationTools,
  registerWebsetExportTools,
  registerWebsetBatchTools
} from "../src/tools/websets/index.js";

async function main() {
  try {
    // Get configuration from environment variables
    const config = {
      exaApiKey: process.env.EXA_API_KEY || '',
      enabledTools: process.env.ENABLED_TOOLS ? process.env.ENABLED_TOOLS.split(',') : undefined,
      debug: process.env.DEBUG_MODE === 'true'
    };

    // Validate API key
    if (!config.exaApiKey) {
      console.error('Error: EXA_API_KEY environment variable is required');
      process.exit(1);
    }

    if (config.debug) {
      console.error('[DEBUG] Starting Exa Websets MCP Server');
      console.error('[DEBUG] Config:', { 
        hasApiKey: !!config.exaApiKey, 
        enabledTools: config.enabledTools,
        debug: config.debug 
      });
    }

    // Create MCP server directly
    const mcpServer = new McpServer({
      name: "exa-websets-server", 
      version: "1.0.0"
    });

    // Register all 43 working Websets API tools (4 export tools return "not available" messages)
    if (config.debug) {
      console.error('[DEBUG] Registering all 43 working Websets API tools');
    }

    try {
      registerWebsetManagementTools(mcpServer, config);
      registerWebsetSearchTools(mcpServer, config);
      registerWebsetEnrichmentTools(mcpServer, config);
      registerWebsetItemTools(mcpServer, config);
      registerWebsetOperationTools(mcpServer, config);
      registerWebsetExportTools(mcpServer, config); // Export tools return "not available" messages
      registerWebsetBatchTools(mcpServer, config);

      if (config.debug) {
        console.error('[DEBUG] All 43 working Websets tools registered successfully');
      }
    } catch (error) {
      console.error('[ERROR] Failed to register tools:', error);
      throw error;
    }

    // Create STDIO transport
    const transport = new StdioServerTransport();
    
    if (config.debug) {
      console.error('[DEBUG] Connecting server to STDIO transport');
    }

    // Connect the underlying server to the transport
    await mcpServer.server.connect(transport);

    if (config.debug) {
      console.error('[DEBUG] Server started successfully on STDIO');
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      if (config.debug) {
        console.error('[DEBUG] Received SIGINT, shutting down...');
      }
      await mcpServer.server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      if (config.debug) {
        console.error('[DEBUG] Received SIGTERM, shutting down...');
      }
      await mcpServer.server.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

main();
