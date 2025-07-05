import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'] });

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

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

        // Exchange code for access token
        const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
            code,
            codeVerifier: 'challenge', // You should store this from the initial auth request
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
        console.error('❌ OAuth Error:', error);
        return NextResponse.json({
            error: 'Authentication failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 