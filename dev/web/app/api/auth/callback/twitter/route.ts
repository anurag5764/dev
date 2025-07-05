import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'] });

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // Get code verifier and state from cookies
    const codeVerifier = request.cookies.get('oauth_code_verifier')?.value;
    const storedState = request.cookies.get('oauth_state')?.value;

    console.log('🔍 OAuth Callback Debug Info:');
    console.log('📝 Code:', code);
    console.log('🔗 State from URL:', state);
    console.log('🔗 State from cookie:', storedState);
    console.log('🔑 Code Verifier from cookie:', codeVerifier ? 'Present' : 'Missing');

    if (!code) {
        console.error('No authorization code provided');
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    if (!codeVerifier) {
        console.error('No code verifier found in cookies');
        return NextResponse.json({
            error: 'No code verifier found',
            message: 'Please restart the OAuth flow'
        }, { status: 400 });
    }

    if (!storedState || state !== storedState) {
        console.error('State mismatch or missing');
        return NextResponse.json({
            error: 'Invalid state parameter',
            message: 'Please restart the OAuth flow'
        }, { status: 400 });
    }

    try {
        console.log('🔄 Attempting to exchange code for access token...');
        console.log('📝 Using code verifier from cookies');

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

        // Create success response
        const response = NextResponse.json({
            success: true,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
            message: 'X API authentication successful'
        });

        // Clear the OAuth cookies
        const isProduction = process.env.NODE_ENV === 'production';

        response.cookies.set('oauth_code_verifier', '', {
            maxAge: 0,
            secure: isProduction,
            sameSite: 'lax'
        });
        response.cookies.set('oauth_state', '', {
            maxAge: 0,
            secure: isProduction,
            sameSite: 'lax'
        });

        return response;
    } catch (error) {
        console.error('❌ OAuth Error Details:', error);
        console.error('❌ Error Message:', error instanceof Error ? error.message : 'Unknown error');

        return NextResponse.json({
            error: 'Authentication failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            debug: {
                hasCode: !!code,
                hasState: !!state,
                hasCodeVerifier: !!codeVerifier,
                hasStoredState: !!storedState,
                hasClientId: !!process.env.X_CLIENT_ID,
                hasClientSecret: !!process.env.X_CLIENT_SECRET,
                codeLength: code?.length || 0,
                stateLength: state?.length || 0,
                codeVerifierLength: codeVerifier?.length || 0
            }
        }, { status: 500 });
    }
} 