import { NextResponse } from 'next/server';
const { getAccessToken } = require('../../../../../oauth.js');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('❌ OAuth error:', error);
      return NextResponse.redirect(new URL('/auth/error?error=' + error, request.url));
    }

    if (!code) {
      console.error('❌ No authorization code received');
      return NextResponse.redirect(new URL('/auth/error?error=no_code', request.url));
    }

    console.log('🔑 Received authorization code:', code);

    // Exchange code for access token
    const { accessToken, refreshToken } = await getAccessToken(code);

    // Store tokens securely (in production, use a database)
    // For now, we'll redirect with success message
    const successUrl = new URL('/auth/success', request.url);
    successUrl.searchParams.set('access_token', accessToken);
    successUrl.searchParams.set('refresh_token', refreshToken);

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/error?error=' + error.message, request.url));
  }
} 