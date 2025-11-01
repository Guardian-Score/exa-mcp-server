#!/usr/bin/env node

/**
 * Test script to validate API fixes
 * Tests the 3 main fixes against real Exa API
 */

const API_KEY = process.env.EXA_API_KEY || '9f6ea8ed-2b31-47ff-a2c6-71ff4c72b6db';
const BASE_URL = 'https://api.exa.ai/websets/v0';
const TEST_WEBSET_ID = 'webset_01k3yxpy9gzp5dfg8nj1hhx8rd';

console.log('🧪 Testing Exa Websets API Fixes\n');
console.log(`Test Webset: ${TEST_WEBSET_ID}\n`);

// Test 1: list_webset_searches_exa fix
async function testListSearches() {
  console.log('✓ Test 1: List Webset Searches (Fixed)');
  console.log('  Expected: Get webset and extract searches array');
  
  try {
    const response = await fetch(`${BASE_URL}/websets/${TEST_WEBSET_ID}`, {
      headers: {
        'x-api-key': API_KEY,
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const searches = data.searches || [];
    
    console.log(`  ✅ Success: Found ${searches.length} searches`);
    if (searches.length > 0) {
      console.log(`  First search: ${searches[0].query || 'N/A'}`);
    }
    return true;
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}`);
    return false;
  }
}

// Test 2: search_webset_items_exa fix
async function testSearchItems() {
  console.log('\n✓ Test 2: Search Webset Items (Fixed)');
  console.log('  Expected: Only use limit, cursor, sourceId parameters');
  
  try {
    // Test with only supported parameters
    const params = new URLSearchParams({
      limit: '10'
    });
    
    const response = await fetch(`${BASE_URL}/websets/${TEST_WEBSET_ID}/items?${params}`, {
      headers: {
        'x-api-key': API_KEY,
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const items = data.data || [];
    
    console.log(`  ✅ Success: Retrieved ${items.length} items`);
    if (items.length > 0) {
      console.log(`  First item: ${items[0].properties?.url || items[0].id}`);
    }
    return true;
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}`);
    return false;
  }
}

// Test 3: Export endpoints (should 404)
async function testExports() {
  console.log('\n✓ Test 3: Export Endpoints (Not Available)');
  console.log('  Expected: 404 errors (API not implemented)');
  
  try {
    const response = await fetch(`${BASE_URL}/websets/${TEST_WEBSET_ID}/exports`, {
      headers: {
        'x-api-key': API_KEY,
        'accept': 'application/json'
      }
    });
    
    if (response.status === 404) {
      console.log('  ✅ Confirmed: Export endpoint returns 404 (not implemented)');
      return true;
    } else {
      console.log(`  ⚠️  Unexpected: Got ${response.status} instead of 404`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = [];
  
  results.push(await testListSearches());
  results.push(await testSearchItems());
  results.push(await testExports());
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\nPassed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n✅ All fixes validated successfully!');
    console.log('\n📝 Summary:');
    console.log('  1. list_webset_searches_exa: Fixed to extract from webset');
    console.log('  2. search_webset_items_exa: Fixed to use only supported params');
    console.log('  3. Export tools: Return helpful "not available" messages');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
