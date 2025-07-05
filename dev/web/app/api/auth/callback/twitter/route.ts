import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.local'] });

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const codeVerifier = searchParams.get('code_verifier');

    console.log('🔍 OAuth Callback Debug Info:');
    console.log('📝 Code:', code);
    console.log('🔗 State:', state);
    console.log('🔑 Code Verifier from URL:', codeVerifier);

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

    try {
        console.log('🔄 Attempting to exchange code for access token...');
        console.log('📝 Using code verifier:', codeVerifier);

        // Try different redirect URI formats
        const redirectUris = [
            'http://localhost:3000/api/auth/callback/twitter',
            'http://localhost:3000/auth/callback/twitter',
            'http://localhost:3000/callback/twitter',
            'http://localhost:3000'
        ];

        let tokenData = null;
        let lastError = null;

        for (const redirectUri of redirectUris) {
            try {
                console.log(`🔄 Trying redirect URI: ${redirectUri}`);

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

                tokenData = await tokenResponse.json();

                console.log(`📊 Token Response Status: ${tokenResponse.status}`);
                console.log(`📊 Token Response Data:`, tokenData);

                if (tokenResponse.ok) {
                    console.log(`✅ Success with redirect URI: ${redirectUri}`);
                    break;
                } else {
                    lastError = `Failed with ${redirectUri}: ${tokenResponse.status} - ${JSON.stringify(tokenData)}`;
                }
            } catch (error) {
                lastError = `Error with ${redirectUri}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
        }

        if (!tokenData || !tokenData.access_token) {
            throw new Error(`All redirect URIs failed. Last error: ${lastError}`);
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
                hasState: !!state,
                hasCodeVerifier: !!codeVerifier,
                hasClientId: !!process.env.X_CLIENT_ID,
                hasClientSecret: !!process.env.X_CLIENT_SECRET,
                codeLength: code?.length || 0,
                stateLength: state?.length || 0,
                codeVerifierLength: codeVerifier?.length || 0
            }
        }, { status: 500 });
    }
} 