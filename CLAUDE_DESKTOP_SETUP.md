# Claude Desktop Setup - Exa MCP Server with Websets

## 🚀 Quick Setup

Your Claude Desktop is now configured to use the integrated Exa MCP server with **50+ tools** including all websets functionality!

### Configuration Location
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Current Configuration

```json
{
  "mcpServers": {
    "exa-websets-local": {
      "command": "node",
      "args": [
        "/Users/0x/code/guardianscore/exa-mcp-server/.smithery/stdio/index.cjs"
      ],
      "env": {
        "EXA_API_KEY": "REDACTED",
        "ENABLED_TOOLS": "web_search_exa,get_code_context_exa,webset_management,webset_search,webset_enrichment,webset_items,webset_operations,webset_batch",
        "DEBUG_MODE": "false"
      }
    }
  }
}
```

## 📊 Available Tools

### Base Search Tools (Always Enabled)
- ✅ `web_search_exa` - Real-time web search
- ✅ `get_code_context_exa` - Code context and examples

### Websets API Tools (Enabled)
- ✅ `webset_management` - 6 tools for creating and managing websets
- ✅ `webset_search` - 4 tools for running targeted searches
- ✅ `webset_enrichment` - 5 tools for AI-powered data extraction
- ✅ `webset_items` - 4 tools for managing webset items
- ✅ `webset_operations` - 20 tools for imports, monitors, webhooks, events
- ✅ `webset_batch` - 4 tools for bulk operations

### Optional Tools (Not Enabled)
- `crawling_exa` - Web content crawling
- `deep_researcher_start` - Start comprehensive research
- `deep_researcher_check` - Check research status
- `linkedin_search_exa` - LinkedIn profile search
- `company_research_exa` - Company research
- `webset_export` - Export guidance (API not available)

## 🔧 Customizing Your Configuration

### Enable All Tools
```json
"ENABLED_TOOLS": "web_search_exa,get_code_context_exa,crawling_exa,deep_researcher_start,deep_researcher_check,linkedin_search_exa,company_research_exa,webset_management,webset_search,webset_enrichment,webset_items,webset_operations,webset_export,webset_batch"
```

### Enable Only Websets Tools
```json
"ENABLED_TOOLS": "webset_management,webset_search,webset_enrichment,webset_items,webset_operations,webset_batch"
```

### Enable Debug Mode
```json
"DEBUG_MODE": "true"
```

## 🧪 Testing the Setup

1. **Restart Claude Desktop** (Important!)
   - Completely quit Claude Desktop (Cmd+Q)
   - Reopen the application

2. **Check MCP Connection**
   - Look for the 🔌 icon in Claude Desktop
   - It should show "exa-websets-local" as connected

3. **Test with a Query**
   ```
   Can you list the available Exa tools?
   ```
   
   Or test websets specifically:
   ```
   Can you help me create a webset to find CTOs at Series A fintech companies?
   ```

## 📝 Example Workflows

### Lead Discovery
```
1. "Create a webset to find CTOs at Series A fintech companies"
2. "Add email enrichment to extract contact information"
3. "List all items found in the webset"
4. "Show me the first 10 leads with their enriched data"
```

### Monitoring Setup
```
1. "Create a webset for Y Combinator alumni companies"
2. "Set up a daily monitor to find new companies"
3. "Create a webhook to notify me when new items are found"
```

### Code Research
```
1. "Search for examples of React Server Components with TypeScript"
2. "Find the latest best practices for Next.js 14 app router"
```

## 🔄 Rebuilding After Changes

If you make changes to the source code:

```bash
cd /Users/0x/code/guardianscore/exa-mcp-server
npm run build
```

Then restart Claude Desktop to load the new build.

## 🐛 Troubleshooting

### Server Not Connecting

1. Check the logs:
   ```bash
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

2. Verify the build exists:
   ```bash
   ls -lh /Users/0x/code/guardianscore/exa-mcp-server/.smithery/stdio/index.cjs
   ```

3. Test the server manually:
   ```bash
   node /Users/0x/code/guardianscore/exa-mcp-server/.smithery/stdio/index.cjs
   ```
   (Press Ctrl+C to exit)

### Tools Not Showing

- Make sure you restarted Claude Desktop completely (not just reload)
- Check that `ENABLED_TOOLS` includes the tool groups you want
- Verify your API key is valid

### API Limitations

Some websets features have limitations:
- **Export API**: Not yet available (returns guidance messages)
- **Item filtering**: Limited to `limit`, `cursor`, `sourceId`
- **Searches**: Embedded in webset objects

See [API_LIMITATIONS.md](./API_LIMITATIONS.md) for details and workarounds.

## 📚 Documentation

- **API Limitations**: [API_LIMITATIONS.md](./API_LIMITATIONS.md)
- **Implementation Details**: [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)
- **Quick Start**: [QUICK_START.md](./QUICK_START.md)
- **Main README**: [README.md](./README.md)

## ✅ Success!

Your Claude Desktop is now configured with the most comprehensive Exa MCP server available, featuring:
- ✅ Real-time web search
- ✅ Code context search
- ✅ 43 working websets tools
- ✅ Lead discovery and enrichment
- ✅ Monitoring and webhooks
- ✅ Batch operations

Happy researching! 🔍✨
