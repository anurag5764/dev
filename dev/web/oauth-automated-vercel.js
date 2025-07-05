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

export async function generateAuthUrl() {
  try {
    validateEnv();
    
    const client = new TwitterApi({
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
    });

    const authLink = await client.generateOAuth2AuthLink(
      'https://bugbuddy-dev.vercel.app/api/auth/callback/twitter',
      { scope: ['tweet.read', 'tweet.write', 'users.read'] },
      { codeChallengeMethod: 'S256' }
    );
    
    console.log('✅ Automated OAuth URL generated (Vercel):');
    console.log('🔗 Authorization URL:', authLink.url);
    console.log('📝 Code Verifier:', authLink.codeVerifier);
    console.log('🔗 State:', authLink.state);
    console.log('📝 Note: For Vercel, you may need to manually add the code verifier to the callback URL');
    console.log('📝 Code Verifier to add:', authLink.codeVerifier);
    
    return authLink;
  } catch (error) {
    console.error('❌ OAuth Error:', error.message);
    throw error;
  }
}

// Test the automated OAuth flow
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAuthUrl().catch(console.error);
} 