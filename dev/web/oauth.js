require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

// X API v2 OAuth Configuration
const CLIENT_ID = process.env.X_CLIENT_ID;
const CLIENT_SECRET = process.env.X_CLIENT_SECRET;
const REDIRECT_URI = process.env.X_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/twitter';

// Initialize Twitter API client
const client = new TwitterApi({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

/**
 * Generate OAuth 2.0 authorization URL
 * @returns {string} Authorization URL
 */
async function generateAuthUrl() {
  try {
    const authUrl = await client.generateOAuth2AuthLink(
      REDIRECT_URI,
      { scope: ['tweet.read', 'tweet.write', 'users.read'] }
    );
    console.log('🔗 Authorization URL:', authUrl.url);
    return authUrl.url;
  } catch (error) {
    console.error('❌ Error generating auth URL:', error.message);
    throw error;
  }
}

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from callback
 * @returns {Object} Access token and refresh token
 */
async function getAccessToken(code) {
  try {
    const { client: loggedClient, accessToken, refreshToken } = await client.loginWithOAuth2({
      code,
      codeVerifier: 'challenge',
      redirectUri: REDIRECT_URI,
    });

    console.log('✅ Access token obtained successfully!');
    console.log('🔑 Access Token:', accessToken);
    console.log('🔄 Refresh Token:', refreshToken);

    return {
      client: loggedClient,
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('❌ Error obtaining access token:', error.message);
    throw error;
  }
}

/**
 * Test the OAuth flow
 */
async function testOAuthFlow() {
  try {
    console.log('🚀 Starting X API v2 OAuth flow...');
    
    // Check if environment variables are set
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('❌ Missing X API credentials. Please set X_CLIENT_ID and X_CLIENT_SECRET in .env file');
      console.log('📝 Required environment variables:');
      console.log('   X_CLIENT_ID=your_client_id');
      console.log('   X_CLIENT_SECRET=your_client_secret');
      console.log('   X_REDIRECT_URI=http://localhost:3000/api/auth/callback/twitter (optional)');
      return;
    }

    // Generate authorization URL
    const authUrl = await generateAuthUrl();
    
    console.log('\n📋 Next steps:');
    console.log('1. Open the authorization URL in your browser');
    console.log('2. Log in with your X credentials');
    console.log('3. Authorize the application');
    console.log('4. Copy the authorization code from the callback URL');
    console.log('5. Use the code with getAccessToken(code) function');
    
    return authUrl;
  } catch (error) {
    console.error('❌ OAuth flow test failed:', error.message);
  }
}

/**
 * Verify credentials and test API access
 * @param {string} accessToken - Access token to test
 */
async function testApiAccess(accessToken) {
  try {
    const userClient = new TwitterApi(accessToken);
    const me = await userClient.v2.me();
    console.log('✅ API access verified!');
    console.log('👤 User:', me.data);
    return me.data;
  } catch (error) {
    console.error('❌ API access test failed:', error.message);
    throw error;
  }
}

// Export functions for use in other modules
module.exports = {
  generateAuthUrl,
  getAccessToken,
  testOAuthFlow,
  testApiAccess,
  client
};

// Run test if this file is executed directly
if (require.main === module) {
  testOAuthFlow();
} 