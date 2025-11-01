// Test script to diagnose webset API issues
import axios from 'axios';

const API_KEY = '9f6ea8ed-2b31-47ff-a2c6-71ff4c72b6db';
const WEBSET_ID = 'webset_01k3yxpy9gzp5dfg8nj1hhx8rd';
const BASE_URL = 'https://api.exa.ai';

async function testEndpoints() {
  console.log('Testing Websets API endpoints...\n');
  console.log(`Webset ID: ${WEBSET_ID}\n`);
  
  // Test 1: Get Webset Details
  console.log('1. Testing GET /websets/v0/websets/{id}');
  try {
    const response = await axios.get(`${BASE_URL}/websets/v0/websets/${WEBSET_ID}`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log('✓ Success:', response.status);
    console.log('Status:', response.data.status);
    console.log('Searches:', response.data.searches?.length || 0);
    console.log('Items found:', response.data.searches?.[0]?.found || 0);
  } catch (error) {
    console.log('✗ Error:', error.response?.status, error.response?.statusText);
    console.log('  Message:', error.response?.data);
  }
  console.log('');
  
  // Test 2: List Webset Items
  console.log('2. Testing GET /websets/v0/websets/{id}/items');
  try {
    const response = await axios.get(`${BASE_URL}/websets/v0/websets/${WEBSET_ID}/items`, {
      headers: { 'x-api-key': API_KEY },
      params: { limit: 10 }
    });
    console.log('✓ Success:', response.status);
    console.log('Items found:', response.data.data?.length || 0);
    if (response.data.data?.[0]) {
      console.log('Sample item:', response.data.data[0].url);
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.status, error.response?.statusText);
    console.log('  Message:', error.response?.data);
  }
  console.log('');
  
  // Test 3: List Searches
  console.log('3. Testing GET /websets/v0/websets/{id}/searches');
  try {
    const response = await axios.get(`${BASE_URL}/websets/v0/websets/${WEBSET_ID}/searches`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log('✓ Success:', response.status);
    console.log('Searches:', response.data.data?.length || 0);
  } catch (error) {
    console.log('✗ Error:', error.response?.status, error.response?.statusText);
    console.log('  Message:', error.response?.data);
  }
  console.log('');
  
  // Test 4: Create Export
  console.log('4. Testing POST /websets/v0/websets/{id}/exports');
  try {
    const response = await axios.post(`${BASE_URL}/websets/v0/websets/${WEBSET_ID}/exports`, {
      format: 'json'
    }, {
      headers: { 
        'x-api-key': API_KEY,
        'content-type': 'application/json'
      }
    });
    console.log('✓ Success:', response.status);
    console.log('Export ID:', response.data.id);
  } catch (error) {
    console.log('✗ Error:', error.response?.status, error.response?.statusText);
    console.log('  Message:', error.response?.data);
  }
  console.log('');
  
  // Test 5: Search Items with filter
  console.log('5. Testing GET /websets/v0/websets/{id}/items with query params');
  try {
    const response = await axios.get(`${BASE_URL}/websets/v0/websets/${WEBSET_ID}/items`, {
      headers: { 'x-api-key': API_KEY },
      params: { 
        limit: 5,
        offset: 0
      }
    });
    console.log('✓ Success:', response.status);
    console.log('Items:', response.data.data?.length || 0);
  } catch (error) {
    console.log('✗ Error:', error.response?.status, error.response?.statusText);
    console.log('  Message:', error.response?.data);
  }
}

testEndpoints().catch(console.error);
