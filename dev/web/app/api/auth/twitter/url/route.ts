import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import { generateOAuthUrl } from '../../../../../lib/twitter-client';

dotenv.config({ path: ['.env', '.env.local'] });

export async function GET() {
    try {
        const authLink = await generateOAuthUrl();

        // Store codeVerifier and state in a secure, short-lived, HTTP-only cookie using NextResponse
        const cookieValue = JSON.stringify({
            codeVerifier: authLink.codeVerifier,
            state: authLink.state,
            timestamp: Date.now() // Add timestamp for validation
        });

        const response = NextResponse.json({
            url: authLink.url,
            state: authLink.state,
        });
        response.cookies.set({
            name: 'twitter_oauth',
            value: cookieValue,
            httpOnly: true,
            secure: true, // Set to true for production (HTTPS)
            sameSite: 'lax',
            maxAge: 300, // 5 minutes
            path: '/',
        });
        return response;
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
} 