import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'] });

export async function GET(request: NextRequest) {
    try {
        // Generate PKCE challenge
        const codeVerifier = crypto.randomBytes(32).toString('base64url');
        const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

        const client = new TwitterApi({
            clientId: process.env.X_CLIENT_ID!,
            clientSecret: process.env.X_CLIENT_SECRET!,
        });

        const authLink = await client.generateOAuth2AuthLink(
            'https://bugbuddy-dev.vercel.app/api/auth/callback/twitter',
            { scope: ['tweet.read', 'tweet.write', 'users.read'] },
            { codeChallenge, codeChallengeMethod: 'S256' }
        );

        // Store the code verifier in a cookie for the callback to use
        const response = NextResponse.json({
            success: true,
            authUrl: authLink.url,
            codeVerifier,
            state: authLink.state
        });

        return response;
    } catch (error) {
        console.error('❌ OAuth Init Error:', error);
        return NextResponse.json({
            error: 'Failed to initialize OAuth',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 