import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: ['.env', '.env.local'] });

// Validate required environment variables
function validateEnv() {
  const required = ['X_CLIENT_ID', 'X_CLIENT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Store code verifier temporarily
function storeCodeVerifier(codeVerifier, state) {
  const tempDir = path.join(process.cwd(), '.temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const verifierData = {
    codeVerifier,
    state,
    timestamp: Date.now()
  };
  
  fs.writeFileSync(
    path.join(tempDir, 'oauth-verifier.json'),
    JSON.stringify(verifierData, null, 2)
  );
  
  console.log('📝 Code verifier stored temporarily');
}

// Retrieve code verifier by state
function getCodeVerifier(state) {
  try {
    const tempDir = path.join(process.cwd(), '.temp');
    const verifierPath = path.join(tempDir, 'oauth-verifier.json');
    
    if (!fs.existsSync(verifierPath)) {
      return null;
    }
    
    const verifierData = JSON.parse(fs.readFileSync(verifierPath, 'utf8'));
    
    // Check if state matches and verifier is not too old (5 minutes)
    if (verifierData.state === state && (Date.now() - verifierData.timestamp) < 5 * 60 * 1000) {
      return verifierData.codeVerifier;
    }
    
    return null;
  } catch (error) {
    console.error('Error reading code verifier:', error);
    return null;
  }
}

// Clean up temporary files
function cleanupTempFiles() {
  try {
    const tempDir = path.join(process.cwd(), '.temp');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('🧹 Temporary files cleaned up');
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
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
      'http://localhost:3000/api/auth/callback/twitter',
      { scope: ['tweet.read', 'tweet.write', 'users.read'] },
      { codeChallengeMethod: 'S256' }
    );
    
    // Store the code verifier temporarily
    storeCodeVerifier(authLink.codeVerifier, authLink.state);
    
    console.log('✅ Automated OAuth URL generated:');
    console.log('🔗 Authorization URL:', authLink.url);
    console.log('📝 Code Verifier: Stored automatically');
    console.log('🔗 State:', authLink.state);
    console.log('📝 Note: No manual code verifier entry needed!');
    
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

export { getCodeVerifier, cleanupTempFiles }; 