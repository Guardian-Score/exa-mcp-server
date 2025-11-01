import axios from 'axios';

const API_KEY = '9f6ea8ed-2b31-47ff-a2c6-71ff4c72b6db';
const WEBSET_ID = 'webset_01k3yxpy9gzp5dfg8nj1hhx8rd';
const BASE_URL = 'https://api.exa.ai';

async function testSearchItems() {
  console.log('Testing search_webset_items variations:\n');
  
  // Test with different parameter combinations
  const tests = [
    { name: 'Just limit', params: { limit: 5 } },
    { name: 'Limit + cursor', params: { limit: 5, cursor: 'witem_01k3yxqknjqwc7s0gqqwc7s0gq' } },
    { name: 'Query param', params: { limit: 5, query: 'Salt Lake' } },
    { name: 'Type filter', params: { limit: 5, type: 'company' } },
    { name: 'Verification filter', params: { limit: 5, verificationStatus: 'verified' } }
  ];
  
  for (const test of tests) {
    console.log(`${test.name}:`);
    try {
      const response = await axios.get(`${BASE_URL}/websets/v0/websets/${WEBSET_ID}/items`, {
        headers: { 'x-api-key': API_KEY },
        params: test.params
      });
      console.log(`  ✓ Success - ${response.data.data?.length || 0} items`);
    } catch (error) {
      console.log(`  ✗ Error: ${error.response?.status} - ${error.response?.data?.message}`);
    }
  }
  
  console.log('\n---\n');
  console.log('Testing if searches are in the webset object:\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/websets/v0/websets/${WEBSET_ID}`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log('Webset object contains:');
    console.log('  - searches:', response.data.searches?.length || 0);
    console.log('  - imports:', response.data.imports?.length || 0);
    console.log('  - enrichments:', response.data.enrichments?.length || 0);
    console.log('  - monitors:', response.data.monitors?.length || 0);
    console.log('  - streams:', response.data.streams?.length || 0);
    console.log('\nSearch details embedded in webset:');
    if (response.data.searches?.[0]) {
      const search = response.data.searches[0];
      console.log(`  ID: ${search.id}`);
      console.log(`  Status: ${search.status}`);
      console.log(`  Found: ${search.progress.found}`);
      console.log(`  Analyzed: ${search.progress.analyzed}`);
    }
  } catch (error) {
    console.log('Error getting webset:', error.message);
  }
}

testSearchItems().catch(console.error);
