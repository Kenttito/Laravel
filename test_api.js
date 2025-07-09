import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

async function testAPI() {
  console.log('Testing API endpoints...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const response = await axios.get(`${API_BASE_URL}/api/auth/login`, {
      timeout: 5000
    });
    console.log('✅ Server is running');
  } catch (error) {
    if (error.response?.status === 405) {
      console.log('✅ Server is running (Method not allowed is expected for GET on login)');
    } else {
      console.log('❌ Server connectivity issue:', error.message);
      return;
    }
  }
  
  try {
    // Test 2: Test trader signals endpoint
    console.log('\n2. Testing trader signals endpoint...');
    const response = await axios.get(`${API_BASE_URL}/api/trader-signals/recent`, {
      timeout: 5000
    });
    console.log('✅ Trader signals endpoint working');
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('❌ Trader signals endpoint error:', error.message);
  }
  
  try {
    // Test 3: Test user activity endpoint (should fail without auth)
    console.log('\n3. Testing user activity endpoint (without auth)...');
    const response = await axios.get(`${API_BASE_URL}/api/user/activity`, {
      timeout: 5000
    });
    console.log('❌ Should have failed without auth');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ User activity endpoint working (401 Unauthorized expected)');
    } else {
      console.log('❌ User activity endpoint error:', error.message);
    }
  }
  
  console.log('\n✅ API test completed');
}

testAPI().catch(console.error); 