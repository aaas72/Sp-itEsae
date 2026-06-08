const axios = require('axios');

// Test script to check debts API
async function testDebtsAPI() {
  try {
    console.log('🧪 Testing Debts API...');
    
    // Replace with actual groupId and token
    const groupId = '6798b8c4b8b5b8001f123456'; // Replace with real groupId
    const token = 'your-jwt-token-here'; // Replace with real token
    
    const response = await axios.get(`http://10.0.2.2:5000/api/debts/group/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📡 API Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test server connection first
async function testServerConnection() {
  try {
    console.log('🔗 Testing server connection...');
    const response = await axios.get('http://10.0.2.2:5000/api/health', {
      timeout: 5000
    });
    console.log('✅ Server is running:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    return false;
  }
}

async function main() {
  const serverRunning = await testServerConnection();
  if (serverRunning) {
    await testDebtsAPI();
  } else {
    console.log('⚠️ Cannot test API - server is not running');
  }
}

main();