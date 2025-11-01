import axios from 'axios';

const API_KEY = '9f6ea8ed-2b31-47ff-a2c6-71ff4c72b6db';
const WEBSET_ID = 'webset_01k3yxpy9gzp5dfg8nj1hhx8rd';
const BASE_URL = 'https://api.exa.ai';

async function testDetailed() {
  console.log('Detailed API Testing\n');
  
  // Get full webset details
  console.log('1. Full Webset Details:');
  try {
    const response = await axios.get(`${BASE_URL}/websets/v0/websets/${WEBSET_ID}`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('Error:', error.message);
  }
  console.log('\n---\n');
  
  // Get items with proper params
  console.log('2. List Items (limit only):');
  try {
    const response = await axios.get(`${BASE_URL}/websets/v0/websets/${WEBSET_ID}/items`, {
      headers: { 'x-api-key': API_KEY },
      params: { limit: 3 }
    });
    console.log('Total items:', response.data.data?.length);
    console.log('Has more:', response.data.hasMore);
    console.log('Next cursor:', response.data.nextCursor);
    console.log('\nFirst item structure:');
    console.log(JSON.stringify(response.data.data?.[0], null, 2));
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  }
  console.log('\n---\n');
  
  // Try different search endpoints
  console.log('3. Testing alternate search endpoints:');
  const searchPaths = [
    `/websets/v0/websets/${WEBSET_ID}/searches`,
    `/websets/${WEBSET_ID}/searches`,
    `/v0/websets/${WEBSET_ID}/searches`
  ];
  
  for (const path of searchPaths) {
    try {
      const response = await axios.get(`${BASE_URL}${path}`, {
        headers: { 'x-api-key': API_KEY }
      });
      console.log(`✓ ${path} - Works!`);
    } catch (error) {
      console.log(`✗ ${path} - ${error.response?.status}`);
    }
  }
  
  console.log('\n---\n');
  
  // Try different export endpoints
  console.log('4. Testing alternate export endpoints:');
  const exportPaths = [
    `/websets/v0/websets/${WEBSET_ID}/exports`,
    `/websets/${WEBSET_ID}/exports`,
    `/v0/websets/${WEBSET_ID}/exports`
  ];
  
  for (const path of exportPaths) {
    try {
      const response = await axios.post(`${BASE_URL}${path}`, 
        { format: 'json' },
        { headers: { 'x-api-key': API_KEY, 'content-type': 'application/json' }}
      );
      console.log(`✓ ${path} - Works!`);
    } catch (error) {
      console.log(`✗ ${path} - ${error.response?.status}`);
    }
  }
}

testDetailed().catch(console.error);
