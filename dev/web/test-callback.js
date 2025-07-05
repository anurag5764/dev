import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'] });

async function testTokenExchange() {
    try {
        console.log('🧪 Testing Token Exchange...');
        
        const client = new TwitterApi({
            clientId: process.env.X_CLIENT_ID,
            clientSecret: process.env.X_CLIENT_SECRET,
        });

        // Test with a sample code (this will fail, but we'll see the exact error)
        const testCode = 'test_code';
        const testCodeVerifier = 'ylMVmb-Uw6ro_3iopGQ9zER4984TK11csZsLlHanul8';
        
        console.log('🔑 Client ID:', process.env.X_CLIENT_ID);
        console.log('🔐 Client Secret:', process.env.X_CLIENT_SECRET ? 'Set' : 'Missing');
        console.log('📝 Test Code:', testCode);
        console.log('🔑 Test Code Verifier:', testCodeVerifier);
        
        const tokenResponse = await client.loginWithOAuth2({
            code: testCode,
            codeVerifier: testCodeVerifier,
            redirectUri: 'https://bugbuddy-dev.vercel.app/api/auth/callback/twitter',
        });
        
        console.log('✅ Token exchange successful:', tokenResponse);
        
    } catch (error) {
        console.error('❌ Token Exchange Error:');
        console.error('Error Type:', error.constructor.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        
        // Check if it's a Twitter API error
        if (error.data) {
            console.error('Twitter API Error Data:', error.data);
        }
    }
}

testTokenExchange(); 