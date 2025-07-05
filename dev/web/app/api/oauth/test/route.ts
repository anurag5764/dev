import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'OAuth test endpoint is working',
        timestamp: new Date().toISOString(),
        status: 'ready'
    });
} 