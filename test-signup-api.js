const fetch = require('node-fetch');

async function testSignupAPI() {
  console.log('🧪 TESTING SIGNUP API...\n');
  
  const testUser = {
    username: 'testuser123',
    email: 'testuser123@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'testpass123',
    role: 'ACQUISITIONS'
  };
  
  try {
    console.log('📤 Sending signup request...');
    console.log('Test data:', JSON.stringify(testUser, null, 2));
    
    const response = await fetch('https://flipstackk.kevnbenestate.org/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('\n📄 Raw Response:', responseText);
    
    try {
      const responseData = JSON.parse(responseText);
      console.log('\n✅ Parsed Response:', JSON.stringify(responseData, null, 2));
      
      if (response.ok) {
        console.log('\n🎉 SUCCESS: User created successfully!');
      } else {
        console.log('\n❌ ERROR: Signup failed');
        console.log('Error details:', responseData.error || 'Unknown error');
      }
    } catch (parseError) {
      console.log('\n⚠️ Could not parse response as JSON');
      console.log('Parse error:', parseError.message);
    }
    
  } catch (error) {
    console.error('\n💥 NETWORK ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testSignupAPI();