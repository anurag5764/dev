const { generateAuthUrl, getAccessToken, testApiAccess } = require('./oauth.js');

async function runOAuthTest() {
  try {
    console.log('🧪 Testing X API v2 OAuth Flow...\n');

    // Step 1: Generate authorization URL
    console.log('📝 Step 1: Generating authorization URL...');
    const authUrl = await generateAuthUrl();
    
    console.log('\n📋 Manual Testing Instructions:');
    console.log('1. Copy this URL and open it in your browser:');
    console.log(`   ${authUrl}`);
    console.log('\n2. Log in with your X credentials');
    console.log('3. Authorize the application');
    console.log('4. You will be redirected to: http://localhost:3000/api/auth/callback/twitter');
    console.log('\n5. Check the callback URL for the authorization code');
    console.log('6. Use the code with: getAccessToken("your_code_here")');

    // Example of how to use the authorization code (commented out)
    /*
    console.log('\n📝 Step 2: Exchanging code for access token...');
    const code = 'your_authorization_code_here'; // Replace with actual code
    const { accessToken, refreshToken } = await getAccessToken(code);
    
    console.log('\n📝 Step 3: Testing API access...');
    await testApiAccess(accessToken);
    */

    console.log('\n✅ OAuth flow setup complete!');
    console.log('💡 To complete the test, you need to:');
    console.log('   1. Set up X API credentials in .env file');
    console.log('   2. Run the authorization flow manually');
    console.log('   3. Use the returned code with getAccessToken()');

  } catch (error) {
    console.error('❌ OAuth test failed:', error.message);
  }
}

// Run the test
runOAuthTest(); 