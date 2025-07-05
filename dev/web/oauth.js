import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: ['.env', '.env.local'] });

// Generate PKCE challenge
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

export async function getAccessToken() {
  try {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    const client = new TwitterApi({
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
    });

    const authLink = await client.generateOAuth2AuthLink(
      'https://bugbuddy-dev.vercel.app/api/auth/callback/twitter',
      { scope: ['tweet.read', 'tweet.write', 'users.read'] },
      { codeChallenge, codeChallengeMethod: 'S256' }
    );
    
    console.log('✅ Authorize this app:', authLink.url);
    console.log('📝 Code Verifier (save this):', codeVerifier);
    console.log('🔗 State:', authLink.state);
    
    return { authLink, codeVerifier };
  } catch (error) {
    console.error('❌ OAuth Error:', error);
    throw error;
  }
}

// Test the OAuth flow
getAccessToken().catch(console.error); 