import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'] });

async function testOAuthFlow() {
    try {
        console.log('🧪 Testing OAuth Configuration...');
        console.log('🔑 Client ID:', process.env.X_CLIENT_ID ? 'Set' : 'Missing');
        console.log('🔐 Client Secret:', process.env.X_CLIENT_SECRET ? 'Set' : 'Missing');
        
        const client = new TwitterApi({
            clientId: process.env.X_CLIENT_ID,
            clientSecret: process.env.X_CLIENT_SECRET,
        });

        // Test the OAuth flow
        const authLink = await client.generateOAuth2AuthLink(
            'https://bugbuddy-dev.vercel.app/api/auth/callback/twitter',
            { scope: ['tweet.read', 'tweet.write', 'users.read'] },
            { codeChallenge: 'test', codeChallengeMethod: 'S256' }
        );
        
        console.log('✅ OAuth configuration is valid');
        console.log('🔗 Auth URL generated successfully');
        console.log('📝 Auth URL:', authLink.url);
        
    } catch (error) {
        console.error('❌ OAuth Configuration Error:', error.message);
    }
}

testOAuthFlow(); 