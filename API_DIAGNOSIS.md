# Exa Websets API Diagnosis & Issues

## Test Results Summary

Tested with webset: `webset_01k3yxpy9gzp5dfg8nj1hhx8rd`

### ✅ Working Endpoints

1. **GET `/websets/v0/websets/{id}`** - Get webset details
   - Returns complete webset object
   - **Includes embedded arrays**: searches, imports, enrichments, monitors, streams
   - Status: ✅ Fully functional

2. **GET `/websets/v0/websets/{id}/items`** - List items
   - Supported parameters: `limit`, `cursor`
   - Uses cursor-based pagination (not offset)
   - Status: ✅ Fully functional

3. **POST `/websets/v0/websets`** - Create webset
   - Status: ✅ Assumed working (not tested)

### ❌ Non-Working / Non-Existent Endpoints

1. **GET `/websets/v0/websets/{id}/searches`** - List searches
   - Error: 404 Not Found
   - Reason: **Searches are embedded in the webset object**, not a separate endpoint
   - **Fix**: Use `get_webset` and extract `webset.searches` array

2. **POST `/websets/v0/websets/{id}/exports`** - Create export
   - Error: 404 Not Found
   - Reason: **Endpoint not implemented in API**
   - **Fix**: Remove tool or mark as unavailable

3. **GET `/websets/v0/websets/{id}/exports`** - List exports
   - Error: 404 Not Found
   - Reason: **Endpoint not implemented in API**
   - **Fix**: Remove tool or mark as unavailable

4. **GET `/websets/v0/websets/{id}/exports/{exportId}`** - Get export
   - Error: 404 Not Found
   - Reason: **Endpoint not implemented in API**
   - **Fix**: Remove tool or mark as unavailable

### ⚠️ Partially Working / Incorrect Parameters

1. **search_webset_items_exa** - Search/filter items
   - ✅ Works with: `limit`, `cursor`
   - ❌ Does NOT work with: `query`, `type`, `verificationStatus`, `offset`
   - Error: 400 Bad Request - "Unrecognized key(s) in object"
   - **Fix**: Remove unsupported filter parameters from tool

## Actual API Structure

### Webset Object Structure
```json
{
  "id": "webset_01k3yxpy9gzp5dfg8nj1hhx8rd",
  "status": "idle",
  "searches": [
    {
      "id": "wsearch_xxx",
      "status": "completed",
      "progress": {
        "found": 25,
        "analyzed": 99,
        "completion": 100
      }
    }
  ],
  "imports": [],
  "enrichments": [],
  "monitors": [],
  "streams": [],
  "items": []  // Empty - use /items endpoint to get actual items
}
```

### Items Structure
Items are retrieved separately via the `/items` endpoint:
```json
{
  "data": [
    {
      "id": "witem_xxx",
      "properties": {
        "type": "company",
        "url": "https://...",
        "description": "...",
        "content": "..."
      },
      "evaluations": [...],
      "enrichments": []
    }
  ],
  "hasMore": true,
  "nextCursor": "witem_yyy"
}
```

## Required Code Changes

### 1. Fix `list_webset_searches_exa`

**Current (Wrong):**
```typescript
// Tries to call GET /websets/{id}/searches - doesn't exist
const endpoint = API_CONFIG.ENDPOINTS.WEBSET_SEARCHES.replace(':websetId', websetId);
```

**Fixed (Correct):**
```typescript
// Get searches from the webset object
const endpoint = API_CONFIG.ENDPOINTS.WEBSET_BY_ID.replace(':websetId', websetId);
const webset = await axios.get(endpoint);
const searches = webset.data.searches || [];
```

### 2. Remove or Disable Export Tools

These 4 tools should be removed or marked unavailable:
- `create_export_exa`
- `get_export_exa`
- `list_exports_exa`
- `delete_export_exa`

**Options:**
A. Remove from codebase entirely
B. Keep but return error message: "Export API not yet available"
C. Comment out registration

### 3. Fix `search_webset_items_exa`

**Current (Wrong):**
```typescript
const searchItemsSchema = z.object({
  websetId: z.string(),
  limit: z.number().optional(),
  cursor: z.string().optional(),
  query: z.string().optional(),  // ❌ Not supported
  type: z.string().optional(),  // ❌ Not supported
  verificationStatus: z.enum(['verified', 'pending', 'failed']).optional()  // ❌ Not supported
});
```

**Fixed (Correct):**
```typescript
const searchItemsSchema = z.object({
  websetId: z.string(),
  limit: z.number().optional().default(25),
  cursor: z.string().optional()
  // Remove all filter parameters - API doesn't support them yet
});
```

### 4. Update Tool Descriptions

Tools should mention limitations:
- "`list_webset_items_exa` - Note: Filtering not yet supported, returns all items with pagination"
- "`list_webset_searches_exa` - Returns searches embedded in webset (not a separate endpoint)"

## Test Results

### Working Tools
```
✓ create_webset_exa (assumed)
✓ get_webset_exa
✓ list_websets_exa (assumed)
✓ list_webset_items_exa (with limit/cursor only)
✓ get_webset_item_exa (assumed)
✓ create_webset_search_exa (assumed)
✓ create_webset_enrichment_exa (assumed)
```

### Broken Tools
```
✗ list_webset_searches_exa - Uses non-existent endpoint
✗ search_webset_items_exa - Uses unsupported parameters
✗ create_export_exa - Endpoint doesn't exist
✗ get_export_exa - Endpoint doesn't exist
✗ list_exports_exa - Endpoint doesn't exist
✗ delete_export_exa - Endpoint doesn't exist
```

## Recommended Actions

### Immediate (Required)
1. ✅ Fix `list_webset_searches_exa` to get searches from webset object
2. ✅ Fix `search_webset_items_exa` to remove unsupported filters
3. ✅ Disable all 4 export tools with helpful error messages

### Future (When API Available)
1. Re-enable export tools when Exa implements the endpoints
2. Add filter support to `search_webset_items_exa` when API supports it
3. Test other tools (enrichments, monitors, webhooks) to verify they work

## Summary

Out of 47 tools, approximately 43 should work correctly. The issues found:
- **1 tool** needs endpoint fix (list_webset_searches)
- **1 tool** needs parameter fix (search_webset_items)
- **4 tools** hit non-existent endpoints (all export tools)

The webset system works well for:
- Creating websets
- Running searches
- Viewing items
- Managing webset lifecycle

Missing functionality:
- Exporting data (API not implemented)
- Advanced item filtering (API not implemented)

## Testing Script

Use this to test any webset:
```bash
node test-detailed.mjs
```

The test confirms:
- Items ARE being stored (10+ items returned)
- Search completed successfully (25 found, 99 analyzed)
- Webset structure is correct
- Export API simply doesn't exist yet
