# Required Fixes for Websets MCP

Based on actual API testing with webset `webset_01k3yxpy9gzp5dfg8nj1hhx8rd`

## Issues Found

### 1. ❌ `list_webset_searches_exa` - Wrong Endpoint

**Problem**: Tries to call `/websets/{id}/searches` which returns 404

**Root Cause**: Searches are embedded in the webset object, not a separate endpoint

**Fix Location**: `src/tools/websets/websetSearch.ts` line ~181

**Before**:
```typescript
const endpoint = API_CONFIG.ENDPOINTS.WEBSET_SEARCHES.replace(':websetId', websetId);
const response = await axios.get(`${API_CONFIG.BASE_URL}${endpoint}`);
```

**After**:
```typescript
// Get searches from the webset object instead of separate endpoint
const endpoint = API_CONFIG.ENDPOINTS.WEBSET_BY_ID.replace(':websetId', websetId);
const response = await axios.get(`${API_CONFIG.BASE_URL}${endpoint}`);
const searches = response.data.searches || [];

return {
  content: [{
    type: 'text' as const,
    text: JSON.stringify({
      success: true,
      data: searches,
      total: searches.length
    }, null, 2)
  }]
};
```

### 2. ❌ `search_webset_items_exa` - Unsupported Parameters

**Problem**: Uses filter parameters that return 400 Bad Request

**Root Cause**: API only supports `limit` and `cursor` parameters

**Fix Location**: `src/tools/websets/websetItems.ts` line ~247

**Remove these from schema**:
```typescript
// ❌ Remove - not supported by API
query: z.string().optional()
type: z.string().optional()
verificationStatus: z.enum(['verified', 'pending', 'failed']).optional()
hasEnrichedData: z.boolean().optional()
itemType: z.string().optional()
offset: z.number().optional()  // API uses cursor, not offset
```

**Keep only**:
```typescript
// ✅ Supported by API
limit: z.number().optional().default(25)
cursor: z.string().optional()
```

**Update description**:
```typescript
"List webset items with pagination. Note: Advanced filtering not yet supported by API. Use limit and cursor for pagination only."
```

### 3. ❌ All Export Tools - Endpoints Don't Exist

**Problem**: All 4 export tools return 404 Not Found

**Tools Affected**:
- `create_export_exa`
- `get_export_exa` 
- `list_exports_exa`
- `delete_export_exa`

**Root Cause**: Export API endpoints not implemented yet by Exa

**Fix Location**: `src/tools/websets/websetExport.ts`

**Option A - Remove Tools** (Recommended):
Comment out the registration in `src/tools/websets/index.ts`:
```typescript
// export { registerWebsetExportTools } from './websetExport.js';  // API not available yet
```

And in `bin/run-server.ts`:
```typescript
// registerWebsetExportTools(mcpServer, config);  // Disabled - API not available
```

**Option B - Return Helpful Error**:
Keep tools but wrap handlers:
```typescript
server.tool(
  "create_export_exa",
  "Create an export job (Currently unavailable - API not implemented)",
  createExportSchema.shape,
  async (args) => {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: false,
          error: "Export API is not yet available. The Exa Websets API hasn't implemented export endpoints yet. Please use list_webset_items_exa and export data manually.",
          endpoints_tested: [
            "POST /websets/v0/websets/{id}/exports - 404",
            "GET /websets/v0/websets/{id}/exports - 404"
          ]
        }, null, 2)
      }],
      isError: true
    };
  }
);
```

## Implementation Plan

### Step 1: Fix `list_webset_searches_exa`
- Update to get searches from webset object
- Test with existing webset

### Step 2: Fix `search_webset_items_exa`  
- Remove unsupported filter parameters
- Update schema to only use limit/cursor
- Update description
- Test pagination works

### Step 3: Handle Export Tools
- Choose Option A (remove) or Option B (helpful error)
- Update tool count in documentation
- Test that server starts without errors

### Step 4: Update Documentation
- Update README to reflect actual API capabilities
- Note which features aren't available yet
- Update tool count (47 → 43 working tools)

### Step 5: Test Everything
- Test with the provided webset
- Verify all working tools function correctly
- Ensure error messages are helpful

## Testing Commands

```bash
# Test the fixes
cd /Users/0x/code/ai/exa-websets-mcp
EXA_API_KEY=9f6ea8ed-2b31-47ff-a2c6-71ff4c72b6db npx tsx bin/run-server.ts

# In Claude/Cursor, test:
"List searches for webset webset_01k3yxpy9gzp5dfg8nj1hhx8rd"
"List items in webset webset_01k3yxpy9gzp5dfg8nj1hhx8rd"
"Try to create an export for webset webset_01k3yxpy9gzp5dfg8nj1hhx8rd"
```

## Files to Modify

1. `src/tools/websets/websetSearch.ts` - Fix list_webset_searches_exa
2. `src/tools/websets/websetItems.ts` - Fix search_webset_items_exa
3. `src/tools/websets/websetExport.ts` - Disable or add error messages
4. `src/tools/websets/index.ts` - Optionally remove export registration
5. `bin/run-server.ts` - Update tool count and registration
6. `README.md` - Update documentation
7. `IMPLEMENTATION_COMPLETE.md` - Update status

## Expected Results After Fixes

### Working Tools: 43
- ✅ 6 Management tools
- ✅ 3 Search tools (list_searches now works correctly)
- ✅ 5 Enrichment tools  
- ✅ 3 Item tools (search_items now works correctly)
- ✅ 20 Operations tools
- ❌ 0 Export tools (disabled until API available)
- ✅ 4 Batch tools

### Status Messages
- "Successfully registered 43 Websets tools (4 export tools disabled - API not available)"
- Clear error messages when users try unavailable features
- Cursor-based pagination working correctly

## Priority

1. **High Priority**: Fix list_webset_searches_exa (breaks user workflow)
2. **High Priority**: Fix search_webset_items_exa parameters (causes errors)
3. **Medium Priority**: Handle export tools gracefully (prevents user confusion)
4. **Low Priority**: Update documentation
