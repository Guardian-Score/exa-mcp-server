# Exa Websets API - Known Limitations

This document outlines current limitations and workarounds for the Exa Websets API based on official documentation and testing.

## Summary

**Total Tools**: 43 working tools (4 export tools unavailable)

---

## 1. Export Functionality (Not Available)

### Affected Tools
- `create_export_exa` ❌
- `get_export_exa` ❌
- `list_exports_exa` ❌
- `delete_export_exa` ❌

### Issue
All export endpoints return **404 Not Found**. The export API has not been implemented by Exa yet.

### Workarounds
1. **Use `list_webset_items_exa`** with pagination (up to 200 items per page)
2. **Use `get_webset_item_exa`** for individual item details
3. **Export programmatically** after fetching all items
4. **Use Exa Dashboard** at https://websets.exa.ai for manual exports

### Example: Fetching All Items
```javascript
// Fetch all items with pagination
let allItems = [];
let cursor = undefined;
const limit = 200; // Maximum per page

do {
  const response = await list_webset_items_exa({
    websetId: 'your_webset_id',
    limit: limit,
    cursor: cursor
  });
  
  allItems.push(...response.items);
  cursor = response.nextCursor;
} while (cursor);

// Now export allItems to your desired format
```

---

## 2. Search Listing (Implementation Detail)

### Affected Tool
- `list_webset_searches_exa` ✅ (Fixed)

### Issue
There is no separate `/websets/{id}/searches` endpoint. Searches are embedded in the webset object.

### Solution
The tool now calls `GET /websets/{id}` and extracts the `searches` array from the response.

### API Response Structure
```json
{
  "id": "webset_xxx",
  "searches": [
    {
      "id": "search_xxx",
      "status": "completed",
      "query": "...",
      "progress": {...}
    }
  ],
  "items": [...],
  "enrichments": [...],
  "monitors": [...]
}
```

---

## 3. Item Filtering (Limited Parameters)

### Affected Tool
- `search_webset_items_exa` ✅ (Fixed)

### Issue
The items API only supports these parameters:
- `limit` - Number of items per page (max 200)
- `cursor` - Pagination cursor
- `sourceId` - Filter by source ID (optional)

### Previously Unsupported (Now Removed)
- ❌ `type` - Item type filtering
- ❌ `verificationStatus` - Verification filtering
- ❌ `createdAfter/Before` - Date range filtering
- ❌ `hasEnrichedData` - Enrichment filtering
- ❌ Metadata filtering
- ❌ Pattern matching

### Workaround: Client-Side Filtering
```javascript
// Fetch items
const response = await search_webset_items_exa({
  websetId: 'your_webset_id',
  limit: 200
});

// Filter client-side
const filtered = response.items.filter(item => {
  return item.properties.type === 'company' &&
         item.url.includes('example.com');
});
```

---

## 4. API Documentation References

- **Official Docs**: https://docs.exa.ai/websets/api/overview
- **Get Webset Endpoint**: https://docs.exa.ai/websets/api/websets/get-a-webset
- **List Items Endpoint**: https://docs.exa.ai/websets/api/websets/items/list-all-items-for-a-webset
- **Support**: Contact Exa for API updates and feature requests

---

## Testing with Real Websets

These fixes were validated using:
- **Test Webset ID**: `webset_01k3yxpy9gzp5dfg8nj1hhx8rd`
- **API Version**: v0
- **Last Updated**: January 2025

---

## Reporting Issues

If you encounter additional API limitations:
1. Test with the official Exa API directly
2. Check the official documentation
3. Open an issue in this repository with:
   - Tool name
   - Expected behavior
   - Actual behavior
   - API response (if applicable)
