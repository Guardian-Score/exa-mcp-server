#!/usr/bin/env node

/**
 * Exa Websets MCP Server - Stdio Implementation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Mock tools for Exa - expose tools even without API key
const mockTools = [
  {
    name: "exa_search",
    description: "Search the web using Exa's neural search engine",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query"
        },
        num_results: {
          type: "number",
          description: "Number of results to return",
          default: 10,
          maximum: 100
        },
        include_domains: {
          type: "array",
          items: { type: "string" },
          description: "Domains to include in search"
        },
        exclude_domains: {
          type: "array",
          items: { type: "string" },
          description: "Domains to exclude from search"
        },
        start_crawl_date: {
          type: "string",
          description: "Start date for crawl (YYYY-MM-DD)"
        },
        end_crawl_date: {
          type: "string",
          description: "End date for crawl (YYYY-MM-DD)"
        },
        start_published_date: {
          type: "string",
          description: "Start date for published content (YYYY-MM-DD)"
        },
        end_published_date: {
          type: "string",
          description: "End date for published content (YYYY-MM-DD)"
        },
        use_autoprompt: {
          type: "boolean",
          description: "Use Exa's autoprompt feature",
          default: true
        },
        type: {
          type: "string",
          enum: ["neural", "keyword"],
          description: "Search type",
          default: "neural"
        },
        category: {
          type: "string",
          enum: ["company", "research paper", "news", "linkedin profile", "github", "tweet", "movie", "song", "personal site", "pdf"],
          description: "Category filter for search results"
        },
        include_text: {
          type: "boolean",
          description: "Include text content in results",
          default: false
        },
        text_length_max: {
          type: "number",
          description: "Maximum text length to include",
          default: 1000
        }
      },
      required: ["query"]
    }
  },
  {
    name: "exa_find_similar",
    description: "Find pages similar to a given URL using Exa",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL to find similar pages for"
        },
        num_results: {
          type: "number",
          description: "Number of results to return",
          default: 10,
          maximum: 100
        },
        include_domains: {
          type: "array",
          items: { type: "string" },
          description: "Domains to include in search"
        },
        exclude_domains: {
          type: "array",
          items: { type: "string" },
          description: "Domains to exclude from search"
        },
        category: {
          type: "string",
          enum: ["company", "research paper", "news", "linkedin profile", "github", "tweet", "movie", "song", "personal site", "pdf"],
          description: "Category filter for search results"
        },
        include_text: {
          type: "boolean",
          description: "Include text content in results",
          default: false
        }
      },
      required: ["url"]
    }
  },
  {
    name: "exa_get_contents",
    description: "Get the contents of specific URLs using Exa",
    inputSchema: {
      type: "object",
      properties: {
        ids: {
          type: "array",
          items: { type: "string" },
          description: "List of Exa result IDs to get contents for"
        },
        urls: {
          type: "array",
          items: { type: "string" },
          description: "List of URLs to get contents for"
        },
        text: {
          type: "boolean",
          description: "Include text content",
          default: true
        },
        highlights: {
          type: "boolean",
          description: "Include highlights",
          default: false
        },
        summary: {
          type: "boolean",
          description: "Include AI-generated summary",
          default: false
        }
      }
    }
  },
  {
    name: "exa_search_and_contents",
    description: "Search and get contents in one request using Exa",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query"
        },
        num_results: {
          type: "number",
          description: "Number of results to return",
          default: 10,
          maximum: 100
        },
        include_domains: {
          type: "array",
          items: { type: "string" },
          description: "Domains to include in search"
        },
        exclude_domains: {
          type: "array",
          items: { type: "string" },
          description: "Domains to exclude from search"
        },
        type: {
          type: "string",
          enum: ["neural", "keyword"],
          description: "Search type",
          default: "neural"
        },
        category: {
          type: "string",
          enum: ["company", "research paper", "news", "linkedin profile", "github", "tweet", "movie", "song", "personal site", "pdf"],
          description: "Category filter for search results"
        },
        text: {
          type: "boolean",
          description: "Include text content",
          default: true
        },
        highlights: {
          type: "boolean",
          description: "Include highlights",
          default: false
        },
        summary: {
          type: "boolean",
          description: "Include AI-generated summary",
          default: false
        }
      },
      required: ["query"]
    }
  },
  {
    name: "exa_create_webset",
    description: "Create a webset (collection of URLs) using Exa",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the webset"
        },
        description: {
          type: "string",
          description: "Description of the webset"
        },
        urls: {
          type: "array",
          items: { type: "string" },
          description: "List of URLs to include in the webset"
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for the webset"
        }
      },
      required: ["name", "urls"]
    }
  },
  {
    name: "exa_list_websets",
    description: "List all websets created by the user",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of websets to return",
          default: 50
        }
      }
    }
  },
  {
    name: "exa_get_webset",
    description: "Get details of a specific webset",
    inputSchema: {
      type: "object",
      properties: {
        webset_id: {
          type: "string",
          description: "ID of the webset to retrieve"
        }
      },
      required: ["webset_id"]
    }
  },
  {
    name: "exa_update_webset",
    description: "Update an existing webset",
    inputSchema: {
      type: "object",
      properties: {
        webset_id: {
          type: "string",
          description: "ID of the webset to update"
        },
        name: {
          type: "string",
          description: "New name for the webset"
        },
        description: {
          type: "string",
          description: "New description for the webset"
        },
        urls: {
          type: "array",
          items: { type: "string" },
          description: "New list of URLs for the webset"
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "New tags for the webset"
        }
      },
      required: ["webset_id"]
    }
  },
  {
    name: "exa_delete_webset",
    description: "Delete a webset",
    inputSchema: {
      type: "object",
      properties: {
        webset_id: {
          type: "string",
          description: "ID of the webset to delete"
        }
      },
      required: ["webset_id"]
    }
  }
];

async function executeTool(name, args) {
  // Return mock responses indicating API key is needed
  const apiKeyRequiredResponse = {
    success: false,
    message: `Tool '${name}' requires Exa API key. Please configure EXA_API_KEY environment variable.`,
    requiresAuth: true,
    tool: name,
    providedArgs: args,
    setupInstructions: "Get your API key from https://dashboard.exa.ai/"
  };

  switch (name) {
    case "exa_search":
    case "exa_find_similar":
    case "exa_get_contents":
    case "exa_search_and_contents":
    case "exa_create_webset":
    case "exa_list_websets":
    case "exa_get_webset":
    case "exa_update_webset":
    case "exa_delete_webset":
      return apiKeyRequiredResponse;
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

class ExaMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'exa-websets-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: mockTools };
    });

    // Execute tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        const result = await executeTool(name, args || {});
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error(`Tool execution failed: ${error.message}`);
        
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('MCP Server error:', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Exa Websets MCP Server running on stdio');
  }
}

// Start the server
const server = new ExaMCPServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
