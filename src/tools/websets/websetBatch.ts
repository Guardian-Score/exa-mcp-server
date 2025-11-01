import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios, { isAxiosError } from "axios";
import { API_CONFIG } from "../config.js";
import { 
  WebsetItem,
  BatchUpdateItemsInput,
  BatchDeleteItemsInput,
  UpdateItemInput
} from "../../types.js";

// Schema definitions
const batchUpdateItemsSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  itemIds: z.array(z.string()).describe("Array of item IDs to update"),
  updates: z.object({
    metadata: z.record(z.string()).optional().describe("Metadata to add/update"),
    addTags: z.array(z.string()).optional().describe("Tags to add"),
    removeTags: z.array(z.string()).optional().describe("Tags to remove"),
    customFields: z.record(z.any()).optional().describe("Custom fields to update")
  }).describe("Updates to apply to all items")
});

const batchDeleteItemsSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  itemIds: z.array(z.string()).describe("Array of item IDs to delete")
});

const updateItemSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  itemId: z.string().describe("The ID of the item to update"),
  metadata: z.record(z.string()).optional().describe("Metadata to update"),
  verification: z.object({
    status: z.enum(['verified', 'pending', 'failed']).describe("Verification status"),
    reasoning: z.string().optional().describe("Reasoning for verification status")
  }).optional().describe("Verification status update"),
  customFields: z.record(z.any()).optional().describe("Custom fields to update")
});

const batchVerifyItemsSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  itemIds: z.array(z.string()).describe("Array of item IDs to verify"),
  status: z.enum(['verified', 'pending', 'failed']).describe("Verification status to set"),
  reasoning: z.string().optional().describe("Reasoning for bulk verification")
});

export function registerWebsetBatchTools(server: McpServer, config: any) {
  // Update Single Item
  server.tool(
    "update_webset_item_exa",
    "Update a single webset item's metadata, verification status, or custom fields",
    updateItemSchema.shape,
    async (args) => {
      try {
        const { websetId, itemId, ...updateData } = args;
        const endpoint = API_CONFIG.ENDPOINTS.WEBSET_ITEM_BY_ID
          .replace(':websetId', websetId)
          .replace(':itemId', itemId);
        
        const body: UpdateItemInput = {
          ...(updateData.metadata && { metadata: updateData.metadata }),
          ...(updateData.verification && { verification: updateData.verification }),
          ...(updateData.customFields && { customFields: updateData.customFields })
        };
        
        const response = await axios.patch<WebsetItem>(
          `${API_CONFIG.BASE_URL}${endpoint}`,
          body,
          {
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
            }
          }
        );
        
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              data: response.data,
              message: 'Item updated successfully'
            }, null, 2)
          }]
        };
      } catch (error) {
        if (isAxiosError(error)) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                error: error.response?.data?.error || error.message,
                details: error.response?.data
              }, null, 2)
            }],
            isError: true
          };
        }
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );

  // Batch Update Items
  server.tool(
    "batch_update_items_exa",
    "Update multiple webset items at once with the same changes",
    batchUpdateItemsSchema.shape,
    async (args) => {
      try {
        const { websetId, itemIds, updates } = args;
        const endpoint = `${API_CONFIG.ENDPOINTS.WEBSET_ITEMS}/batch-update`
          .replace(':websetId', websetId);
        
        const body: BatchUpdateItemsInput = {
          itemIds,
          updates
        };
        
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${endpoint}`,
          body,
          {
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
            }
          }
        );
        
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              data: response.data,
              message: `Successfully updated ${itemIds.length} items`
            }, null, 2)
          }]
        };
      } catch (error) {
        if (isAxiosError(error)) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                error: error.response?.data?.error || error.message,
                details: error.response?.data
              }, null, 2)
            }],
            isError: true
          };
        }
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );

  // Batch Delete Items
  server.tool(
    "batch_delete_items_exa",
    "Delete multiple webset items at once",
    batchDeleteItemsSchema.shape,
    async (args) => {
      try {
        const { websetId, itemIds } = args;
        const endpoint = `${API_CONFIG.ENDPOINTS.WEBSET_ITEMS}/batch-delete`
          .replace(':websetId', websetId);
        
        const body: BatchDeleteItemsInput = {
          itemIds
        };
        
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${endpoint}`,
          body,
          {
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
            }
          }
        );
        
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              data: response.data,
              message: `Successfully deleted ${itemIds.length} items`
            }, null, 2)
          }]
        };
      } catch (error) {
        if (isAxiosError(error)) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                error: error.response?.data?.error || error.message,
                details: error.response?.data
              }, null, 2)
            }],
            isError: true
          };
        }
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );

  // Batch Verify Items
  server.tool(
    "batch_verify_items_exa",
    "Verify or update verification status for multiple items at once",
    batchVerifyItemsSchema.shape,
    async (args) => {
      try {
        const { websetId, itemIds, status, reasoning } = args;
        const endpoint = `${API_CONFIG.ENDPOINTS.WEBSET_ITEMS}/batch-verify`
          .replace(':websetId', websetId);
        
        const body = {
          itemIds,
          verification: {
            status,
            ...(reasoning && { reasoning })
          }
        };
        
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${endpoint}`,
          body,
          {
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
            }
          }
        );
        
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              data: response.data,
              message: `Successfully updated verification status for ${itemIds.length} items`
            }, null, 2)
          }]
        };
      } catch (error) {
        if (isAxiosError(error)) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                error: error.response?.data?.error || error.message,
                details: error.response?.data
              }, null, 2)
            }],
            isError: true
          };
        }
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}