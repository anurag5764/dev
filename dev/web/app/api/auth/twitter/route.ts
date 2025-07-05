import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'] });

export async function GET() {
    try {
        // Generate PKCE challenge
        const codeVerifier = crypto.randomBytes(32).toString('base64url');
        const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

        // Generate state
        const state = crypto.randomBytes(16).toString('base64url');

        // Build OAuth URL manually
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: process.env.X_CLIENT_ID!,
            redirect_uri: 'https://bugbuddy-dev.vercel.app/api/auth/callback/twitter',
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            scope: 'tweet.read tweet.write users.read'
        });

        const authUrl = `https://x.com/i/oauth2/authorize?${params.toString()}`;

        // Create response with the OAuth URL and store code verifier in session storage
        const response = NextResponse.json({
            success: true,
            authUrl: authUrl,
            codeVerifier: codeVerifier, // Include in response for client-side storage
            state: state,
            message: 'OAuth URL generated successfully'
        });

        console.log('🔑 OAuth Init:', {
            codeVerifier: codeVerifier ? 'Present' : 'Missing',
            state: state ? 'Present' : 'Missing',
            authUrl: authUrl.substring(0, 50) + '...'
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