'use server';

import { NextRequest, NextResponse } from 'next/server';

const JUPITER_QUOTE_API_URL = 'https://quote-api.jup.ag/v6';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${JUPITER_QUOTE_API_URL}/swap`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Jupiter API error: ${response.status} - ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Jupiter swap proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get swap transaction' },
            { status: 500 }
        );
    }
}
