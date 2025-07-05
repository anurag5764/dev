import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: ['.env', '.env.local'] });

async function testLocalOAuth() {
    try {
        console.log('🧪 Testing Local OAuth...');
        
        const codeVerifier = crypto.randomBytes(32).toString('base64url');
        const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
        
        const client = new TwitterApi({
            clientId: process.env.X_CLIENT_ID,
            clientSecret: process.env.X_CLIENT_SECRET,
        });

        const authLink = await client.generateOAuth2AuthLink(
            'http://localhost:3000/api/auth/callback/twitter',
            { scope: ['tweet.read', 'tweet.write', 'users.read'] },
            { codeChallenge, codeChallengeMethod: 'S256' }
        );
        
        console.log('✅ Local OAuth URL generated:');
        console.log('🔗 Auth URL:', authLink.url);
        console.log('📝 Code Verifier:', codeVerifier);
        console.log('🔗 State:', authLink.state);
        
    } catch (error) {
        console.error('❌ Local OAuth Error:', error.message);
    }
}

testLocalOAuth(); 