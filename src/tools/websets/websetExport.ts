import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios, { isAxiosError } from "axios";
import { API_CONFIG } from "../config.js";
import { 
  Export, 
  CreateExportInput,
  PaginatedList
} from "../../types.js";

// Schema definitions
const createExportSchema = z.object({
  websetId: z.string().describe("The ID of the webset to export"),
  format: z.enum(['csv', 'json', 'xlsx']).describe("Export format"),
  filters: z.object({
    itemIds: z.array(z.string()).optional().describe("Specific item IDs to export"),
    verificationStatus: z.enum(['verified', 'pending', 'failed']).optional().describe("Filter by verification status"),
    hasEnrichedData: z.boolean().optional().describe("Filter by enrichment status"),
    itemType: z.string().optional().describe("Filter by item type")
  }).optional().describe("Filters to apply to the export"),
  fields: z.array(z.string()).optional().describe("Specific fields to include in the export")
});

const getExportSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  exportId: z.string().describe("The ID of the export job")
});

const listExportsSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  limit: z.number().optional().default(20).describe("Number of exports to return"),
  cursor: z.string().optional().describe("Pagination cursor")
});

const deleteExportSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  exportId: z.string().describe("The ID of the export to delete")
});

export function registerWebsetExportTools(server: McpServer, config: any) {
  // Create Export
  server.tool(
    "create_export_exa",
    {
      description: "Create an export job to download webset items in various formats. NOTE: Export API is not yet available - use list_webset_items_exa for data access.",
      paramsSchema: createExportSchema.shape
    },
    async (args) => {
      // Export API not yet implemented by Exa
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            available: false,
            feature: 'Webset Exports',
            message: 'Export functionality is not yet available in the Exa Websets API. The export endpoints return 404 errors as they have not been implemented yet.',
            requestedFormat: args.format,
            alternatives: [
              'Use list_webset_items_exa to fetch all items with pagination (limit up to 200 per page)',
              'Export items programmatically in your application after fetching',
              'Use the Exa Dashboard at https://websets.exa.ai for manual exports',
              'Use get_webset_item_exa to retrieve individual items with full details'
            ],
            documentation: 'https://docs.exa.ai/websets/api/overview',
            note: 'Contact Exa support for updates on export API availability'
          }, null, 2)
        }]
      };
    }
  );

  // Get Export
  server.tool(
    "get_export_exa",
    "Get details of a specific export job. NOTE: Export API is not yet available.",
    getExportSchema.shape,
    async (args) => {
      // Export API not yet implemented by Exa
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            available: false,
            feature: 'Webset Exports',
            message: 'Export functionality is not yet available in the Exa Websets API.',
            requestedExportId: args.exportId,
            alternatives: [
              'Use list_webset_items_exa to fetch items directly',
              'Use get_webset_item_exa for individual item details'
            ],
            documentation: 'https://docs.exa.ai/websets/api/overview'
          }, null, 2)
        }]
      };
    }
  );

  // List Exports
  server.tool(
    "list_exports_exa",
    "List all export jobs for a webset. NOTE: Export API is not yet available.",
    listExportsSchema.shape,
    async (args) => {
      // Export API not yet implemented by Exa
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            available: false,
            feature: 'Webset Exports',
            message: 'Export functionality is not yet available in the Exa Websets API.',
            requestedWebsetId: args.websetId,
            alternatives: [
              'Use list_webset_items_exa to access webset items directly'
            ],
            documentation: 'https://docs.exa.ai/websets/api/overview'
          }, null, 2)
        }]
      };
    }
  );

  // Delete Export
  server.tool(
    "delete_export_exa",
    "Delete an export job. NOTE: Export API is not yet available.",
    deleteExportSchema.shape,
    async (args) => {
      // Export API not yet implemented by Exa
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            available: false,
            feature: 'Webset Exports',
            message: 'Export functionality is not yet available in the Exa Websets API.',
            requestedExportId: args.exportId,
            documentation: 'https://docs.exa.ai/websets/api/overview'
          }, null, 2)
        }]
      };
    }
  );
}