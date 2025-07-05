import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'] });

// Validate required environment variables
function validateEnv() {
  const required = ['X_CLIENT_ID', 'X_CLIENT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export async function getAccessToken() {
  try {
    // Validate environment variables
    validateEnv();
    
    const client = new TwitterApi({
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
    });

    // Use the library's built-in PKCE handling
    const authLink = await client.generateOAuth2AuthLink(
      'https://bugbuddy-dev.vercel.app/api/auth/callback/twitter',
      { scope: ['tweet.read', 'tweet.write', 'users.read'] },
      { codeChallengeMethod: 'S256' }
    );
    
    console.log('✅ Authorize this app:', authLink.url);
    console.log('📝 Code Verifier (save this):', authLink.codeVerifier);
    console.log('🔗 State:', authLink.state);
    
    return { authLink, codeVerifier: authLink.codeVerifier };
  } catch (error) {
    console.error('❌ OAuth Error:', error.message);
    throw error;
  }
}

// Test the OAuth flow
if (import.meta.url === `file://${process.argv[1]}`) {
  getAccessToken().catch(console.error);
} 