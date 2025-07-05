import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'] });

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    console.log('🔍 OAuth Callback Debug Info:');
    console.log('📝 Code:', code);
    console.log('🔗 State:', state);
    console.log('🔑 Client ID:', process.env.X_CLIENT_ID ? 'Set' : 'Missing');
    console.log('🔐 Client Secret:', process.env.X_CLIENT_SECRET ? 'Set' : 'Missing');

    if (!code) {
        console.error('No authorization code provided');
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        // Create client with app credentials
        const client = new TwitterApi({
            clientId: process.env.X_CLIENT_ID!,
            clientSecret: process.env.X_CLIENT_SECRET!,
        });

        console.log('🔄 Attempting to exchange code for access token...');

        // Exchange code for access token
        const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
            code,
            codeVerifier: 'sflTpUcKR1-mMIQj7ppEpHFtMwabRmKvRHwYcyCUGRo', // Use the actual code verifier from the latest OAuth test
            redirectUri: 'https://bugbuddy-dev.vercel.app/api/auth/callback/twitter',
        });

        console.log('✅ Access Token obtained successfully:', accessToken);

        return NextResponse.json({
            success: true,
            accessToken,
            refreshToken,
            expiresIn,
            message: 'X API authentication successful'
        });
    } catch (error) {
        console.error('❌ OAuth Error Details:', error);
        console.error('❌ Error Message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('❌ Error Stack:', error instanceof Error ? error.stack : 'No stack trace');

        return NextResponse.json({
            error: 'Authentication failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            debug: {
                hasCode: !!code,
                hasState: !!state,
                hasClientId: !!process.env.X_CLIENT_ID,
                hasClientSecret: !!process.env.X_CLIENT_SECRET
            }
        }, { status: 500 });
    }
} 