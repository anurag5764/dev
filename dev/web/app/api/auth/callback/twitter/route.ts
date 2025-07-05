import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'] });

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const codeVerifier = searchParams.get('code_verifier');

    console.log('🔍 OAuth Callback Debug Info (GET):');
    console.log('📝 Code:', code);
    console.log('🔗 State:', state);
    console.log('🔑 Code Verifier from URL:', codeVerifier ? 'Present' : 'Missing');

    if (!code) {
        console.error('No authorization code provided');
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    if (!codeVerifier) {
        console.error('No code verifier provided');
        return NextResponse.json({
            error: 'No code verifier provided',
            message: 'Please include the code_verifier parameter in the callback URL'
        }, { status: 400 });
    }

    return await exchangeCodeForToken(code, codeVerifier);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, state, code_verifier } = body;

        console.log('🔍 OAuth Callback Debug Info (POST):');
        console.log('📝 Code:', code);
        console.log('🔗 State:', state);
        console.log('🔑 Code Verifier from body:', code_verifier ? 'Present' : 'Missing');

        if (!code) {
            console.error('No authorization code provided');
            return NextResponse.json({ error: 'No code provided' }, { status: 400 });
        }

        if (!code_verifier) {
            console.error('No code verifier provided');
            return NextResponse.json({
                error: 'No code verifier provided',
                message: 'Please include the code_verifier in the request body'
            }, { status: 400 });
        }

        return await exchangeCodeForToken(code, code_verifier);
    } catch (error) {
        console.error('❌ POST request error:', error);
        return NextResponse.json({
            error: 'Invalid request body',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
    }
}

async function exchangeCodeForToken(code: string, codeVerifier: string) {
    try {
        console.log('🔄 Attempting to exchange code for access token...');
        console.log('📝 Using code verifier:', codeVerifier);

        // Use only the correct Vercel redirect URI
        const redirectUri = 'https://bugbuddy-dev.vercel.app/api/auth/callback/twitter';

        console.log(`🔄 Using redirect URI: ${redirectUri}`);

        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                code_verifier: codeVerifier
            })
        });

        const tokenData = await tokenResponse.json();

        console.log('📊 Token Response Status:', tokenResponse.status);
        console.log('📊 Token Response Data:', tokenData);

        if (!tokenResponse.ok) {
            throw new Error(`Token exchange failed: ${tokenResponse.status} - ${JSON.stringify(tokenData)}`);
        }

        console.log('✅ Access Token obtained successfully');

        return NextResponse.json({
            success: true,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
            message: 'X API authentication successful'
        });
    } catch (error) {
        console.error('❌ OAuth Error Details:', error);
        console.error('❌ Error Message:', error instanceof Error ? error.message : 'Unknown error');

        return NextResponse.json({
            error: 'Authentication failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            debug: {
                hasCode: !!code,
                hasCodeVerifier: !!codeVerifier,
                hasClientId: !!process.env.X_CLIENT_ID,
                hasClientSecret: !!process.env.X_CLIENT_SECRET,
                codeLength: code?.length || 0,
                codeVerifierLength: codeVerifier?.length || 0
            }
        }, { status: 500 });
    }
} 