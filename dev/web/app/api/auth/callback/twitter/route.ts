import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';
import { cookies } from 'next/headers';

dotenv.config({ path: ['.env', '.env.local'] });

// Retrieve code verifier from cookies by state
async function getCodeVerifierFromCookie(state: string): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const oauthCookie = cookieStore.get('twitter_oauth');

        console.log('🔍 Cookie Debug:');
        console.log('📝 All cookies:', cookieStore.getAll());
        console.log('📝 OAuth cookie found:', !!oauthCookie);

        if (!oauthCookie) {
            console.log('❌ No OAuth cookie found');
            return null;
        }

        console.log('📝 OAuth cookie value:', oauthCookie.value);

        const cookieData = JSON.parse(oauthCookie.value);
        console.log('📝 Parsed cookie data:', cookieData);

        // Check if state matches and verifier is not too old (5 minutes)
        if (cookieData.state === state && (Date.now() - cookieData.timestamp) < 5 * 60 * 1000) {
            console.log('✅ Code verifier retrieved from cookie');
            return cookieData.codeVerifier;
        }

        console.log('❌ Code verifier expired or state mismatch');
        console.log('📝 Expected state:', state);
        console.log('📝 Cookie state:', cookieData.state);
        console.log('📝 Timestamp check:', (Date.now() - cookieData.timestamp) < 5 * 60 * 1000);
        return null;
    } catch (error) {
        console.error('Error reading code verifier from cookie:', error);
        return null;
    }
}

// Clear the OAuth cookie after use
async function clearOAuthCookie() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('twitter_oauth');
        console.log('🧹 OAuth cookie cleared');
    } catch (error) {
        console.error('Error clearing OAuth cookie:', error);
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const manualCodeVerifier = searchParams.get('code_verifier');

    console.log('🔍 OAuth Callback Debug Info:');
    console.log('📝 Code:', code);
    console.log('🔗 State:', state);
    console.log('🔑 Manual Code Verifier from URL:', manualCodeVerifier);

    if (!code) {
        console.error('No authorization code provided');
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    if (!state) {
        console.error('No state provided');
        return NextResponse.json({ error: 'No state provided' }, { status: 400 });
    }

    // Try to get code verifier from cookie first
    let codeVerifier = await getCodeVerifierFromCookie(state);

    // Fallback to manual code verifier if cookie retrieval fails
    if (!codeVerifier && manualCodeVerifier) {
        console.log('📝 Using manual code verifier as fallback');
        codeVerifier = manualCodeVerifier;
    }

    if (!codeVerifier) {
        console.error('No code verifier available');
        return NextResponse.json({
            error: 'No code verifier available',
            message: 'Please try the OAuth flow again or provide code_verifier manually'
        }, { status: 400 });
    }

    try {
        console.log('🔄 Attempting to exchange code for access token...');
        console.log('📝 Using code verifier:', codeVerifier);

        // Dynamically determine the correct redirect URI
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');

        const redirectUri = isLocalhost
            ? `${protocol}://${host}/api/auth/callback/twitter`
            : 'https://bugbuddy-dev.vercel.app/api/auth/callback/twitter';

        console.log(`🔄 Using redirect URI: ${redirectUri}`);
        console.log(`🔄 Host: ${host}, Protocol: ${protocol}, Is Localhost: ${isLocalhost}`);

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

        // Clear the OAuth cookie after successful token exchange
        await clearOAuthCookie();

        return NextResponse.json({
            success: true,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
            message: 'X API authentication successful (Automated OAuth Flow)'
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