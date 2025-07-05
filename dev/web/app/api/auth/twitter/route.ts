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

        // Create response with cookies to store the code verifier and state
        const response = NextResponse.json({
            success: true,
            authUrl: authUrl,
            message: 'OAuth URL generated successfully'
        });

        // Set cookies to store the code verifier and state
        // Use secure: false for development, true for production
        const isProduction = process.env.NODE_ENV === 'production';

        response.cookies.set('oauth_code_verifier', codeVerifier, {
            httpOnly: true,
            secure: isProduction, // Only secure in production
            sameSite: 'lax',
            maxAge: 600 // 10 minutes
        });

        response.cookies.set('oauth_state', state, {
            httpOnly: true,
            secure: isProduction, // Only secure in production
            sameSite: 'lax',
            maxAge: 600 // 10 minutes
        });

        console.log('🍪 Cookies set:', {
            codeVerifier: codeVerifier ? 'Present' : 'Missing',
            state: state ? 'Present' : 'Missing',
            isProduction,
            secure: isProduction
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