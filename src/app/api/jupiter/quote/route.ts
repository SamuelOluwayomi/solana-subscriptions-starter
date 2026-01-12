'use server';

import { NextRequest, NextResponse } from 'next/server';

const JUPITER_QUOTE_API_URL = 'https://quote-api.jup.ag/v6';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Forward all query parameters to Jupiter API
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
            params.append(key, value);
        });

        const response = await fetch(`${JUPITER_QUOTE_API_URL}/quote?${params}`, {
            headers: {
                'Accept': 'application/json',
            },
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
        console.error('Jupiter quote proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch quote from Jupiter API' },
            { status: 500 }
        );
    }
}
