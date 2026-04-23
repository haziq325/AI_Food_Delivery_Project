const axios = require('axios');

async function testRegistration() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'password123';
  
  try {
    console.log(`Testing registration for ${testEmail}...`);
    const res = await axios.post('http://localhost:3000/api/auth/register', {
      email: testEmail,
      password: testPassword,
      name: 'Test User'
    });
    
    console.log('Registration success:', res.data);
    
    // Now try logging in
    console.log('Testing login...');
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: testEmail,
      password: testPassword
    });
    console.log('Login success:', loginRes.data);
    
  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
  }
}

// Note: This requires the Next.js server to be running on port 3000.
// If it's not running, we'll just check the code logic.
console.log('Test script ready. Run with "node test_registration.js" while Next.js is running.');
