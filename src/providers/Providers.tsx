"use client";

import { LazorkitProvider, DEFAULTS } from '@lazorkit/wallet'
import { ReactNode, useState, useEffect, useMemo } from 'react'
import { LoaderProvider } from '@/context/LoaderContext'

export function Providers({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Stable config object to prevent infinite re-renders in LazorkitProvider
    const paymasterConfig = useMemo(() => ({
        paymasterUrl: "/api/paymaster"
    }), [])

    return (
        <LoaderProvider>
            {mounted ? (
                <LazorkitProvider
                    paymasterConfig={paymasterConfig}
                    rpcUrl="https://api.devnet.solana.com"
                >
                    {children}
                </LazorkitProvider>
            ) : (
                <>{children}</>
            )}
        </LoaderProvider>
    )
}
